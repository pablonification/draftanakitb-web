import { connectDB } from '@/app/utils/db';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import axios from 'axios';

export async function GET(request) {
  try {
    console.log('=== TRANSACTION STATUS CHECK ===');
    console.log('Timestamp:', new Date().toISOString());
    
    const { searchParams } = new URL(request.url);
    const ref = searchParams.get('ref');
    console.log('Checking Reference:', ref);

    if (!ref) {
      return NextResponse.json({ error: 'Missing reference' }, { status: 400 });
    }

    await connectDB();
    const Transaction = mongoose.models.Transaction;
    
    // Find the transaction
    const transaction = await Transaction.findOne({ merchantRef: ref });
    
    if (!transaction) {
      console.log('Transaction not found:', ref);
      return NextResponse.json({ status: 'NOT_FOUND' });
    }

    console.log('Found transaction:', {
      ref: ref,
      status: transaction.status,
      xenditQrId: transaction.xenditQrId,
      xenditPaymentId: transaction.xenditPaymentId,
      createdAt: transaction.createdAt
    });

    // If transaction is already in a final state, return that
    if (['PAID', 'FAILED', 'EXPIRED'].includes(transaction.status)) {
      return NextResponse.json({ 
        status: transaction.status,
        paidAt: transaction.paidAt || null,
        xenditPaymentId: transaction.xenditPaymentId || null
      });
    }

    // If the transaction is missing the Xendit QR ID, we assume the webhook will update it
    if (!transaction.xenditQrId) {
      console.log('Transaction missing xenditQrId. Awaiting webhook update.');
      return NextResponse.json({ status: transaction.status });
    }

    // Check status with Xendit API using QR ID
    try {
      const secretKey = process.env.XENDIT_SECRET_KEY;
      const authHeader = "Basic " + Buffer.from(`${secretKey}:`).toString('base64');
      
      console.log('Checking Xendit QR status for:', {
        ref: ref,
        qrId: transaction.xenditQrId
      });

      const response = await axios.get(
        `https://api.xendit.co/qr_codes/${transaction.xenditQrId}`,
        { headers: { 'Authorization': authHeader } }
      );

      console.log('Xendit QR status response:', {
        status: response.status,
        qrStatus: response.data.status,
        data: response.data
      });

      // Map Xendit status to our status
      let newStatus = transaction.status;
      if (response.data.status === 'COMPLETED') {
        newStatus = 'PAID';
      } else if (response.data.status === 'EXPIRED') {
        newStatus = 'EXPIRED';
      }

      // Update transaction if status changed
      if (newStatus !== transaction.status) {
        console.log('Updating transaction status:', {
          ref: ref,
          oldStatus: transaction.status,
          newStatus: newStatus
        });
        transaction.status = newStatus;
        if (newStatus === 'PAID') {
          transaction.paidAt = new Date();
        }
        await transaction.save();
      }

      return NextResponse.json({ 
        status: newStatus,
        paidAt: transaction.paidAt || null,
        xenditPaymentId: transaction.xenditPaymentId || null
      });

    } catch (xenditError) {
      console.error('Error checking Xendit status:', xenditError);
      // If unable to check status and the transaction is old, expire it.
      const now = new Date();
      const transactionAge = now - transaction.createdAt;
      if (transaction.status === 'UNPAID' && transactionAge > 30 * 60 * 1000) {
        transaction.status = 'EXPIRED';
        await transaction.save();
        return NextResponse.json({ status: 'EXPIRED' });
      }
      return NextResponse.json({ status: transaction.status });
    }

  } catch (error) {
    console.error('=== TRANSACTION CHECK ERROR ===');
    console.error('Timestamp:', new Date().toISOString());
    console.error('Error:', error);
    console.error('Stack:', error.stack);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
