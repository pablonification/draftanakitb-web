import { NextResponse } from 'next/server';
import crypto from 'crypto';
import axios from 'axios';
import { connectDB } from '@/app/utils/db';
import mongoose from 'mongoose';

// Import the schema from callback route
const { transactionSchema } = require('./callback/route');
const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);

export async function POST(request) {
  try {
    // Add cache prevention headers
    const response = NextResponse;
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

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

    // Generate idempotency key from timestamp and random string
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const idempotencyKey = `${timestamp}-${randomStr}`;

    // Validate request body
    const body = await request.json();
    if (!body.email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate timestamp to prevent old requests
    if (body.timestamp) {
      const requestAge = Date.now() - parseInt(body.timestamp);
      if (requestAge > 300000) { // 5 minutes
        return NextResponse.json(
          { error: 'Request expired' },
          { status: 400 }
        );
      }
    }

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

    // Validate environment variables
    const privateKey = process.env.TRIPAY_PRIVATE_KEY;
    const apiKey = process.env.TRIPAY_API_KEY;
    const merchant_code = process.env.TRIPAY_MERCHANT_CODE;

    if (!privateKey || !apiKey || !merchant_code) {
      console.error('Missing environment variables');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Create more unique merchant_ref with additional entropy
    const merchant_ref = `TP${timestamp}${randomStr}`;
    const amount = 1001;
    const expiry = parseInt(Math.floor(Date.now()/1000) + (60*60));

    const signature = crypto
      .createHmac('sha256', privateKey)
      .update(merchant_code + merchant_ref + amount)
      .digest('hex');

    // Check if transaction already exists
    const existingTransaction = await Transaction.findOne({
      merchantRef: merchant_ref
    });

    if (existingTransaction) {
      return NextResponse.json(
        { error: 'Duplicate transaction' },
        { status: 409 }
      );
    }

    // Add idempotency key to payload
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
      signature: signature,
      idempotency_key: idempotencyKey
    };

    console.log('>>>>>>>>>Payment Request Payload:', JSON.stringify(payload, null, 2));

    // Add timeout to axios request
    const tripayResponse = await axios.post(
      'https://tripay.co.id/api/transaction/create',
      payload,
      {
        headers: {
          'Authorization': 'Bearer ' + apiKey,
        },
        timeout: 10000, // 10 second timeout
        validateStatus: function (status) {
          return status < 999;
        }
      }
    );

    if (!tripayResponse.data.success) {
      throw new Error(tripayResponse.data.message || 'Payment initialization failed');
    }

    console.log('>>>>>>>>>>>Tripay Response:', JSON.stringify(tripayResponse.data, null, 2));

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
    console.log('Transaction created with media:', {
      ref: transaction.merchantRef,
      hasMedia: !!mediaData
    });

    // Return the response from TriPay
    return NextResponse.json({
      success: true,
      merchantRef: merchant_ref,
      qrUrl: tripayResponse.data.data.qr_url,
      amount: amount,
      expiryTime: expiry,
      timestamp: timestamp
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    // Improved error handling
    console.error('Payment error:', {
      name: error.name,
      message: error.message,
      response: error.response?.data,
      stack: error.stack
    });

    if (error.response?.status === 429) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Payment initialization failed',
        message: error.message,
        code: error.response?.status || 500
      },
      { status: error.response?.status || 500 }
    );
  }
}