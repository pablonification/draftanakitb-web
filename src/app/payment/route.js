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
      console.log('Processing attachment:', {
        hasAttachment: true,
        attachmentLength: body.attachment.length,
        startsWith: body.attachment.substring(0, 30),
        includesBase64: body.attachment.includes('base64,')
      });
      
      try {
        // More robust parsing of the data URL
        if (!body.attachment.includes('base64,')) {
          throw new Error('Invalid attachment: missing base64 marker');
        }

        // Split at the first occurrence of base64,
        const parts = body.attachment.split(/base64,(.+)/);
        if (parts.length !== 3) {
          throw new Error('Invalid attachment structure');
        }

        const header = parts[0];
        const base64Data = parts[1];
        const type = header.split(':')[1]?.split(';')[0];

        console.log('Parsed attachment:', {
          hasHeader: !!header,
          headerLength: header.length,
          hasType: !!type,
          typeValue: type,
          base64Length: base64Data?.length || 0
        });

        if (!type || !base64Data || base64Data.trim().length === 0) {
          throw new Error('Invalid attachment: missing content');
        }

        // Store the media data
        mediaData = {
          type,
          base64: base64Data,
          isVideo: type.startsWith('video/')
        };

        console.log('Media data processed:', {
          type,
          isVideo: type.startsWith('video/'),
          base64Length: base64Data.length
        });

      } catch (mediaError) {
        console.error('Media processing error details:', {
          error: mediaError.message,
          attachment: {
            total_length: body.attachment.length,
            preview: body.attachment.substring(0, 50) + '...',
            has_base64_marker: body.attachment.includes('base64,')
          }
        });
        
        return NextResponse.json(
          { 
            error: 'Media processing failed', 
            details: mediaError.message,
            code: 'MEDIA_PROCESSING_ERROR'
          },
          { status: 400 }
        );
      }
    }

    const privateKey = process.env.TRIPAY_PRIVATE_KEY;
    const apiKey = process.env.TRIPAY_API_KEY;
    const merchant_code = process.env.TRIPAY_MERCHANT_CODE;
    const merchant_ref = 'TP' + Date.now();
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

    console.log('>>>>>>>>>Payment Request Payload:', JSON.stringify(payload, null, 2));
    console.log('>>>>>>>>>Payment Request Headers:', {
      Authorization: 'Bearer ' + apiKey.substring(0, 8) + '...' // Log partial API key for security
    });
    console.log('>>>>>>>>>Payment Request URL:', 'https://tripay.co.id/api/transaction/create');

    const startTime = Date.now();
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
    const requestDuration = Date.now() - startTime;

    console.log('>>>>>>>>>>>Tripay Response:', {
      status: response.status,
      statusText: response.statusText,
      duration: `${requestDuration}ms`,
      headers: response.headers,
      data: JSON.stringify(response.data, null, 2)
    });

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