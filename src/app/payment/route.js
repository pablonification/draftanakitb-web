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
        isString: typeof body.attachment === 'string',
        startsWithData: body.attachment.startsWith('data:'),
        mimeType: body.attachment.split(';')[0]
      });
      
      try {
        // More robust base64 extraction
        const matches = body.attachment.match(/^data:([^;]+);base64,(.+)$/);
        
        if (!matches) {
          console.error('Invalid data URL structure');
          throw new Error('Invalid attachment structure');
        }

        const [, type, base64] = matches;
        
        // Additional validation for videos
        if (type.startsWith('video/')) {
          console.log('Validating video data:', {
            type,
            base64Length: base64.length,
            estimatedSize: Math.round(base64.length * 0.75 / 1024 / 1024) + 'MB'
          });

          // Ensure we have valid base64 data
          try {
            const testDecode = atob(base64);
            if (testDecode.length < 100) { // Sanity check for minimal video size
              throw new Error('Video data too small to be valid');
            }
            console.log('Video data validation passed:', {
              decodedLength: testDecode.length,
              seemsValid: true
            });
          } catch (e) {
            console.error('Video base64 validation failed:', e);
            throw new Error('Invalid video data encoding');
          }
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
          error: mediaError.message,
          attachment: 'Data URL length: ' + (body.attachment?.length || 0)
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
    const amount = 2800;
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
          price: 2800 ,
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