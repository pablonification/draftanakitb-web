import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectToDatabase } from '@/lib/mongodb';
import { connectDB } from '@/app/utils/db';
import mongoose from 'mongoose';

// Define the Transaction model
const transactionSchema = new mongoose.Schema({
  merchantRef: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  attachment: { type: String, default: null },
  mediaData: { type: String, default: null },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['UNPAID', 'PAID', 'EXPIRED', 'FAILED'], default: 'UNPAID' },
  paidAt: { type: Date, default: null },
  tweetStatus: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' },
  tweetError: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  xenditPaymentId: { type: String, default: null },
  xenditQrId: { type: String, default: null }
});

const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);

export async function POST(request) {
  try {
    console.log('=== XENDIT CALLBACK RECEIVED ===');
    console.log('Timestamp:', new Date().toISOString());

    await connectDB();
    const { db } = await connectToDatabase();

    // Get the raw body and parse it
    const rawBody = await request.text();
    const data = JSON.parse(rawBody);
    
    console.log('Webhook payload:', JSON.stringify(data, null, 2));

    // Try to get the Xendit signature header.
    // In development, if missing, we log a warning and continue.
    let xenditSignature = request.headers.get('x-callback-signature');
    if (!xenditSignature) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Missing Xendit signature in development, skipping verification.');
      } else {
        console.warn('Missing Xendit signature in production, skipping verification.');
        // console.error('Missing Xendit signature');
        // return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
      }
    } else {
      const webhookSecret = process.env.XENDIT_WEBHOOK_SECRET;
      const generatedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

      console.log('Signature verification:', {
        received: xenditSignature,
        generated: generatedSignature
      });

      if (xenditSignature !== generatedSignature) {
        console.error('Invalid signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
      }
    }

    // Find transaction using the external_id from the webhook payload
    const transaction = await Transaction.findOne({ merchantRef: data.qr_code.external_id });
    if (!transaction) {
      console.error('Transaction not found:', data.qr_code.external_id);
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    console.log('Found transaction:', {
      ref: data.qr_code.external_id,
      currentStatus: transaction.status,
      event: data.event
    });

    // Map Xendit webhook events to our status
    let newStatus;
    switch (data.event) {
      case 'qr.payment':
        if (data.status === 'COMPLETED') {
          newStatus = 'PAID';
        }
        break;
      case 'qr.expired':
        newStatus = 'EXPIRED';
        break;
      case 'qr.failed':
        newStatus = 'FAILED';
        break;
      default:
        console.log('Unhandled event type:', data.event);
        return NextResponse.json({ success: true }); // Acknowledge but don't process
    }

    if (newStatus) {
      console.log('Updating transaction status:', {
        ref: data.qr_code.external_id,
        oldStatus: transaction.status,
        newStatus: newStatus,
        event: data.event
      });

      transaction.status = newStatus;
      if (newStatus === 'PAID') {
        transaction.paidAt = new Date();
        transaction.xenditPaymentId = data.id;
        transaction.xenditQrId = data.qr_code.id;
      }
      await transaction.save();

      // For a successful payment, create a paid tweet entry.
      if (newStatus === 'PAID') {
        transaction.tweetStatus = 'pending';
        
        let mediaData = null;
        let mediaType = null;
        let mediaUrl = null;

        if (transaction.mediaData) {
          try {
            mediaData = JSON.parse(transaction.mediaData);
            mediaType = mediaData.type;
            mediaUrl = `data:${mediaData.type};base64,${mediaData.base64}`;
          } catch (e) {
            console.error('Error parsing media data:', e);
          }
        }

        const paidTweet = {
          _id: data.qr_code.external_id,
          email: transaction.email,
          messageText: transaction.message,
          mediaData: mediaData ? JSON.stringify(mediaData) : null,
          mediaType: mediaType,
          mediaUrl: mediaUrl,
          tweetStatus: "pending",
          createdAt: new Date(),
          paymentStatus: "completed",
          paymentAmount: transaction.amount,
          notificationSent: false,
          scheduledTime: "20:00",
          xenditPaymentId: data.id,
          xenditQrId: data.qr_code.id
        };

        await db.collection('paidTweets').insertOne(paidTweet);
        
        console.log('Payment successful, created paid tweet entry:', {
          referenceId: data.qr_code.external_id,
          hasMedia: !!mediaData,
          mediaType,
          paymentId: data.id
        });
      }
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('=== CALLBACK ERROR ===');
    console.error('Timestamp:', new Date().toISOString());
    console.error('Error:', error);
    console.error('Stack:', error.stack);
    
    // Always return 200 to acknowledge the webhook, even on error
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error', 
      details: error.message 
    });
  }
}
