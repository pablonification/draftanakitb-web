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
    
    // Generate a truly unique merchant reference
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(4).toString('hex');
    const merchant_ref = `TP${timestamp}${randomString}`;
    
    const amount = 1001;
    const expiry = parseInt(Math.floor(new Date()/1000) + (60*60));

    const signature = crypto
      .createHmac('sha256', privateKey)
      .update(merchant_code + merchant_ref + amount)
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
          name: body.message || "PLACEHOLDER TWEET USER",
          price: 1001,
          quantity: 1
        }
      ],
      expired_time: expiry,
      signature: signature
    };

    console.log('=== TRIPAY PAYMENT REQUEST ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Customer Email:', body.email);
    console.log('Merchant Reference:', merchant_ref);
    console.log('Request Payload:', JSON.stringify(payload, null, 2));

    const response = await axios.post(
      'https://tripay.co.id/api/transaction/create', // Changed from detail to create endpoint
      payload,
      {
        headers: {
          'Authorization': 'Bearer ' + apiKey,
        },
        validateStatus: function (status) {
          return status < 999;
        }
      }
    );

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