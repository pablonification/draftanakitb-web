import { NextResponse } from 'next/server';
import crypto from 'crypto';
import axios from 'axios';
import { connectDB } from '@/app/utils/db';
import mongoose from 'mongoose';

// Use the same Transaction model as in callback
const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', require('../payment/callback/route').transactionSchema);

export async function POST(request) {
  try {
    await connectDB();
    // Add IP logging at the start
    console.log('Server Information:', {
      forwardedFor: request.headers.get('x-forwarded-for'),
      realIP: request.headers.get('x-real-ip'),
      clientIP: request.headers.get('x-client-ip'),
      vercelIP: request.headers.get('x-vercel-ip'),
      vercelProxyIP: request.headers.get('x-vercel-proxy-ip'),
      vercelForwardedFor: request.headers.get('x-vercel-forwarded-for'),
    });

    const body = await request.json();
    
    // More aggressive handling of existing transactions
    await Transaction.updateMany(
      { 
        $or: [
          { email: body.email, status: 'UNPAID' },
          { status: 'UNPAID', createdAt: { $lt: new Date(Date.now() - 30 * 60 * 1000) } }
        ]
      },
      { $set: { status: 'EXPIRED' } }
    );

    // Simplified media handling - just store the original base64 string
    let mediaData = null;
    if (body.attachment) {
      try {
        const [header, base64] = body.attachment.split(',');
        const type = header.split(':')[1]?.split(';')[0];
        
        // Only store if we have valid data
        if (header && base64 && type) {
          mediaData = {
            type,
            base64
          };
          console.log('Media processed:', {
            type,
            base64Length: base64.length
          });
        }
      } catch (mediaError) {
        console.error('Media processing error:', mediaError);
        mediaData = null;
      }
    }

    const privateKey = process.env.TRIPAY_PRIVATE_KEY;
    const apiKey = process.env.TRIPAY_API_KEY;
    const merchant_code = process.env.TRIPAY_MERCHANT_CODE;
    
    // Generate more unique reference with additional entropy
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(16).toString('hex'); // Increased entropy
    const merchant_ref = `TP${timestamp}${randomString}`;
    
    const amount = 1001;
    const expiry = parseInt(Math.floor(new Date()/1000) + (30*60));

    // Add more parameters to signature for uniqueness
    const signature = crypto
      .createHmac('sha256', privateKey)
      .update(merchant_code + merchant_ref + amount + timestamp)
      .digest('hex');

    const payload = {
      method: "QRIS2",
      merchant_ref: merchant_ref,
      amount: amount,
      customer_name: "DraftAnakITB",
      customer_email: body.email || "placeholder@gmail.com",
      order_items: [
        {
          sku: "PAIDMENFESS",
          name: `${body.message || "PLACEHOLDER"}_${timestamp}`, // Add timestamp to make unique
          price: 1001,
          quantity: 1
        }
      ],
      expired_time: expiry,
      signature: signature,
      allow_repeated_payments: false, // Explicitly prevent repeated payments
      is_customer_va_lifetime: false, // Ensure VA/QRIS is not reusable
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/landing/paid?ref=${merchant_ref}`, // Add return URL
      expired_time: expiry
    };

    // Log request payload directly
    console.log('=== TRIPAY REQUEST PAYLOAD ===');
    console.log(payload);

    // First, try to cancel any existing QRIS for this user
    try {
      const closeResponse = await axios.post(
        'https://tripay.co.id/api/transaction/close',
        { reference: merchant_ref },
        {
          headers: { 'Authorization': 'Bearer ' + apiKey },
        }
      );
      console.log('=== TRIPAY CLOSE RESPONSE ===');
      console.log(closeResponse.data);
    } catch (closeError) {
      console.log('No existing transaction to close');
    }

    const response = await axios.post(
      'https://tripay.co.id/api/transaction/create', // Changed from detail to create endpoint
      payload,
      {
        headers: {
          'Authorization': 'Bearer ' + apiKey,
          'Cache-Control': 'no-cache'
        },
        validateStatus: function (status) {
          return status < 999;
        }
      }
    );

    // Log raw response
    console.log('=== TRIPAY RAW RESPONSE ===');
    console.log(response.data);

    // Verify the response contains a new QR
    if (!response.data?.data?.qr_url || response.data?.data?.qr_url.includes('reused')) {
      throw new Error('Invalid QR response from payment provider');
    }

    console.log('=== TRIPAY PAYMENT RESPONSE ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Status:', response.status);
    console.log('Response Data:', JSON.stringify(response.data, null, 2));

    // Create transaction record in database
    const transaction = new Transaction({
      merchantRef: merchant_ref,
      email: body.email,
      message: body.message,
      amount: amount,
      status: 'UNPAID',
      mediaData: mediaData ? JSON.stringify(mediaData) : null, // Store as string
      createdAt: new Date()
    });

    await transaction.save();
    console.log('=== TRANSACTION CREATED ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Transaction:', {
      ref: transaction.merchantRef,
      email: transaction.email,
      amount: transaction.amount,
      hasMedia: !!mediaData
    });

    // Return the response from TriPay
    return NextResponse.json({
      success: true,
      merchantRef: merchant_ref,
      qrUrl: response.data.data.qr_url,
      amount: amount
    });

  } catch (error) {
    console.error('Payment error:', {
      message: error.message,
      response: error.response?.data,
      stack: error.stack
    });
    return NextResponse.json(
      { error: 'Payment initialization failed', details: error.message },
      { status: 500 }
    );
  }
}