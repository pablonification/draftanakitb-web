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
        const matches = body.attachment.match(/^data:([^;]+);base64,(.+)$/);
        
        if (!matches) {
          console.error('Invalid data URL structure');
          throw new Error('Invalid attachment structure');
        }

        const [, type, base64] = matches;
        
        if (type.startsWith('video/')) {
          console.log('Validating video data:', {
            type,
            base64Length: base64.length,
            estimatedSize: Math.round(base64.length * 0.75 / 1024 / 1024) + 'MB'
          });

          try {
            const testDecode = atob(base64);
            if (testDecode.length < 100) {
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

    // === Xendit Integration Start ===
    const secretKey = process.env.XENDIT_SECRET_KEY;
    // Set the callback URL to your ngrok endpoint if not provided via env.
    let callbackUrl = process.env.XENDIT_CALLBACK_URL || "https://8c91-125-164-19-244.ngrok-free.app/api/payment/callback";
    const externalId = 'XENDIT' + Date.now();
    const amount = 1;

    const payload = {
      external_id: externalId,
      type: "DYNAMIC",
      callback_url: callbackUrl,
      amount: amount
    };

    console.log('>>>>>>>>>Xendit Payment Request Payload:', JSON.stringify(payload, null, 2));
    
    // Construct Basic Auth header for Xendit
    const authHeader = "Basic " + Buffer.from(`${secretKey}:`).toString('base64');
    console.log('>>>>>>>>>Xendit Payment Request Headers:', {
      Authorization: authHeader.substring(0, 12) + '...' // showing partial key for security
    });
    console.log('>>>>>>>>>Xendit Payment Request URL:', 'https://api.xendit.co/qr_codes');

    const startTime = Date.now();
    const response = await axios.post(
      'https://api.xendit.co/qr_codes',
      payload,
      {
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        },
        validateStatus: function (status) {
          return status < 999;
        }
      }
    );
    const requestDuration = Date.now() - startTime;

    console.log('>>>>>>>>>>>Xendit Response:', {
      status: response.status,
      statusText: response.statusText,
      duration: `${requestDuration}ms`,
      headers: response.headers,
      data: JSON.stringify(response.data, null, 2)
    });
    // === Xendit Integration End ===

    // Create transaction record in database
    const transaction = new Transaction({
      merchantRef: externalId,
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

    // Create the response and set header "qr_string"
    const nextResp = NextResponse.json({
      success: true,
      merchantRef: externalId,
      qrUrl: response.data.qr_url,
      amount: amount
    });
    nextResp.headers.set("qr_string", response.data.qr_string);
    return nextResp;

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