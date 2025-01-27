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
    type: mongoose.Schema.Types.ObjectId, // Changed to ObjectId reference
    ref: 'uploads',
    default: null
  },
  mediaFileId: { // Existing field to store GridFS file ID
    type: mongoose.Schema.Types.ObjectId,
    ref: 'uploads',
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
    console.log('=== TRIPAY CALLBACK RECEIVED ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Headers:', {
      signature: request.headers.get('X-Callback-Signature'),
      event: request.headers.get('X-Callback-Event'),
    });

    await connectDB();
    const { gfs } = await connectToDatabase();

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
    console.log('Callback payload:', data);

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
    }).exec();

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
      
      // Reference to GridFS file
      let mediaFile = null;
      let mediaType = null;
      let mediaUrl = null;

      if (transaction.mediaFileId) {
        try {
          mediaFile = await gfs.files.findOne({ _id: transaction.mediaFileId });
          if (mediaFile) {
            mediaType = mediaFile.contentType;
            mediaUrl = `/api/files/${mediaFile._id}`; // Create an API route to serve the file
          }
        } catch (e) {
          console.error('Error retrieving media file:', e);
        }
      }

      // Create paid tweet entry
      const paidTweet = {
        _id: data.merchant_ref,
        email: transaction.email,
        messageText: transaction.message,
        mediaFileId: mediaFile ? mediaFile._id : null, // Store reference
        mediaType: mediaType,
        mediaUrl: mediaUrl,
        tweetStatus: "pending",
        createdAt: new Date(data.paid_at),
        paymentStatus: "completed",
        paymentAmount: transaction.amount,
        notificationSent: false,
        scheduledTime: "20:00"
      };

      await gfs.db.collection('paidTweets').insertOne(paidTweet);
      
      console.log('Payment successful, created paid tweet entry:', {
        merchantRef: data.merchant_ref,
        hasMedia: !!mediaFile,
        mediaType
      });
    }

    await transaction.save();
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('=== CALLBACK ERROR ===');
    console.error('Timestamp:', new Date().toISOString());
    console.error('Error:', error);
    console.error('Stack:', error.stack);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
