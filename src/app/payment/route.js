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
        hasAttachment: !!body.attachment,
        attachmentLength: body.attachment.length,
        isString: typeof body.attachment === 'string',
        startsWith: body.attachment.substring(0, 30)
      });
      
      try {
        // Basic validation first
        if (typeof body.attachment !== 'string' || !body.attachment.startsWith('data:')) {
          throw new Error('Invalid attachment: not a valid data URL');
        }

        let type, base64;

        // Handle both formats: with or without base64 prefix
        if (body.attachment.includes(';base64,')) {
          [type, base64] = body.attachment.split(';base64,');
          type = type.replace('data:', '');
        } else {
          console.error('Attachment missing base64 prefix');
          throw new Error('Invalid attachment format: missing base64 encoding');
        }
        
        console.log('Attachment parsing debug:', {
          hasType: !!type,
          typeValue: type,
          base64Length: base64?.length || 0,
          base64Preview: base64?.substring(0, 20) + '...'
        });

        // Validate type and base64
        if (!type || !base64 || base64.trim().length === 0) {
          throw new Error('Invalid attachment: missing data');
        }

        // Validate base64 content
        try {
          atob(base64);
        } catch (e) {
          console.error('Base64 validation failed:', e);
          throw new Error('Invalid base64 encoding');
        }

        mediaData = {
          type,
          base64,
          isVideo: type.startsWith('video/')
        };

        console.log('Media processing successful:', {
          type,
          isVideo: type.startsWith('video/'),
          dataLength: base64.length
        });

      } catch (mediaError) {
        console.error('Detailed media error:', {
          message: mediaError.message,
          attachmentPreview: body.attachment?.substring(0, 50) + '...',
          attachmentLength: body.attachment?.length
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