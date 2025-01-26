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
      
      // Log the attachment data for debugging
      console.log('Transaction attachment data:', {
        attachmentUrl: transaction.attachment,
        hasAttachment: Boolean(transaction.attachment)
      });

      // Validate and process attachment URL
      let mediaUrl = null;
      let mediaType = null;

      if (transaction.attachment) {
        mediaUrl = transaction.attachment;
        // Determine media type from URL or file extension
        if (mediaUrl.match(/\.(jpg|jpeg|png|gif)$/i)) {
          mediaType = 'image';
        } else if (mediaUrl.match(/\.(mp4|mov|avi)$/i)) {
          mediaType = 'video';
        } else {
          // Default to image if can't determine
          mediaType = 'image';
        }
      }

      // Create paid tweet entry with validated attachment
      const paidTweet = {
        _id: data.merchant_ref,
        email: transaction.email,
        messageText: transaction.message,
        mediaUrl: mediaUrl,
        mediaType: mediaType,
        tweetStatus: "pending",
        createdAt: new Date(data.paid_at),
        paymentStatus: "completed",
        paymentAmount: transaction.amount,
        notificationSent: false,
        scheduledTime: "20:00",
        // Add metadata about attachment
        attachmentMetadata: mediaUrl ? {
          originalUrl: mediaUrl,
          processedAt: new Date(),
          type: mediaType
        } : null
      };

      await db.collection('paidTweets').insertOne(paidTweet);
      
      console.log('Payment successful, created paid tweet entry:', {
        merchantRef: data.merchant_ref,
        message: transaction.message,
        hasAttachment: Boolean(mediaUrl),
        mediaType: mediaType,
        mediaUrl: mediaUrl
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
