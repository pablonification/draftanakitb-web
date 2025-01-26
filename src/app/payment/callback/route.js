import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectToDatabase } from '@/lib/mongodb';
import { connectDB } from '@/app/utils/db';
import mongoose from 'mongoose';

// Define the Transaction model here to ensure it's initialized (here for fix conflict with Next.js)
const transactionSchema = new mongoose.Schema({
  merchantRef: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  attachment: {
    type: String,
    default: null
  },
  mediaData: {
    base64: String,
    type: String,
    filename: String
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['UNPAID', 'PAID', 'EXPIRED', 'FAILED'],
    default: 'UNPAID'
  },
  paidAt: {
    type: Date,
    default: null
  },
  tweetStatus: {
    type: String,
    enum: ['pending', 'sent', 'failed'],
    default: 'pending'
  },
  tweetError: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Initialize the model
const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);

const verifySignature = (data, signature) => {
  const privateKey = process.env.TRIPAY_PRIVATE_KEY;
  const jsonString = JSON.stringify(data);
  
  const expectedSignature = crypto
    .createHmac('sha256', privateKey)
    .update(jsonString)
    .digest('hex');

  return signature === expectedSignature;
};

export async function POST(request) {
  try {
    await connectDB();
    const { db } = await connectToDatabase();

    const callbackSignature = request.headers.get('X-Callback-Signature');
    console.log('Received callback with signature:', callbackSignature);

    if (!callbackSignature) {
      console.error('Missing callback signature');
      return NextResponse.json(
        { error: 'Missing callback signature' },
        { status: 400 }
      );
    }

    const data = await request.json();
    console.log('Callback payload:', JSON.stringify(data, null, 2));

    if (!verifySignature(data, callbackSignature)) {
      console.error('Invalid signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 403 }
      );
    }

    // Find transaction
    const transaction = await Transaction.findOne({
      merchantRef: data.merchant_ref
    });

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Update transaction status
    transaction.status = data.status;
    transaction.paidAt = data.paid_at;

    // If payment is successful, create a paid tweet entry
    if (data.status === 'PAID') {
      transaction.tweetStatus = 'pending';
      
      // Log transaction data for debugging
      console.log('Transaction data:', {
        hasMediaData: !!transaction.mediaData,
        mediaType: transaction.mediaData?.type,
        messageLength: transaction.message?.length
      });

      // Process media data
      let mediaUrl = null;
      let mediaType = null;
      let mediaData = transaction.mediaData;  // Get directly from transaction

      if (mediaData && mediaData.base64) {
        mediaType = mediaData.type;
        // Create a proper data URL
        mediaUrl = `data:${mediaData.type};base64,${mediaData.base64}`;

        console.log('Media data processed:', {
          type: mediaType,
          filename: mediaData.filename,
          urlLength: mediaUrl.length,
          hasBase64: !!mediaData.base64
        });
      }

      // Create paid tweet entry with complete media data
      const paidTweet = {
        _id: data.merchant_ref,
        email: transaction.email,
        messageText: transaction.message,
        // Store complete media information
        mediaData: mediaData ? {
          type: mediaType,
          filename: mediaData.filename,
          base64: mediaData.base64
        } : null,
        mediaType: mediaType,
        mediaUrl: mediaUrl,
        tweetStatus: "pending",
        createdAt: new Date(data.paid_at),
        paymentStatus: "completed",
        paymentAmount: transaction.amount,
        notificationSent: false,
        scheduledTime: "20:00"
      };

      // Insert into paidTweets collection
      const result = await db.collection('paidTweets').insertOne(paidTweet);
      
      console.log('Paid tweet created:', {
        merchantRef: data.merchant_ref,
        insertedId: result.insertedId,
        hasMediaData: !!paidTweet.mediaData,
        mediaType: paidTweet.mediaType
      });
    }

    await transaction.save();
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Callback processing error:', {
      message: error.message,
      stack: error.stack
    });
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
