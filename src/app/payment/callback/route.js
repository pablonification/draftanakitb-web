import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { tweet } from '@/app/utils/twitterHandler';
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
      console.error('Invalid signature. Expected:', verifySignature(data, ''), 'Received:', callbackSignature);
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
    await transaction.save();

    // If payment is successful, post the menfess
    if (data.status === 'PAID') {
      const { message, attachment } = transaction;
      console.log('Attempting to post tweet for paid transaction:', {
        merchantRef: data.merchant_ref,
        message,
        hasAttachment: !!attachment
      });

      try {
        await tweet(message, attachment);
        
        // Update transaction with tweet status
        transaction.tweetStatus = 'sent';
        await transaction.save();

      } catch (tweetError) {
        console.error('Tweet posting error:', {
          merchantRef: data.merchant_ref,
          error: tweetError.message,
          stack: tweetError.stack
        });
        transaction.tweetStatus = 'failed';
        transaction.tweetError = tweetError.message;
        await transaction.save();
      }
    }

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
