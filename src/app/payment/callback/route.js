import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectToDatabase } from '@/lib/mongodb';
import { connectDB } from '@/app/utils/db';
import mongoose from 'mongoose';
import { GridFSBucket, ObjectId } from 'mongodb';

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
    type: String,  // Changed from Object to String
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
      
      // Parse stored media data
      let mediaData = null;
      let mediaType = null;
      let mediaUrl = null;

      if (transaction.mediaData) {
        try {
          mediaData = JSON.parse(transaction.mediaData);
          mediaType = mediaData.type;
          
          // Retrieve the file from GridFS
          const bucket = new GridFSBucket(db, { bucketName: 'videos' });
          const downloadStream = bucket.openDownloadStream(ObjectId(mediaData.fileId));

          let fileBuffer = Buffer.alloc(0);

          downloadStream.on('data', (chunk) => {
            fileBuffer = Buffer.concat([fileBuffer, chunk]);
          });

          await new Promise((resolve, reject) => {
            downloadStream.on('end', resolve);
            downloadStream.on('error', reject);
          });

          // Convert Buffer to Base64 URL for usage
          const base64 = fileBuffer.toString('base64');
          mediaUrl = `data:${mediaType};base64,${base64}`;

        } catch (e) {
          console.error('Error retrieving media from GridFS:', e);
        }
      }

      // Create paid tweet entry
      const paidTweet = {
        _id: data.merchant_ref,
        email: transaction.email,
        messageText: transaction.message,
        mediaData: mediaData ? JSON.stringify(mediaData) : null, // Store as string
        mediaType: mediaType,
        mediaUrl: mediaUrl,
        tweetStatus: "pending",
        createdAt: new Date(data.paid_at),
        paymentStatus: "completed",
        paymentAmount: transaction.amount,
        notificationSent: false,
        scheduledTime: "20:00"
      };

      await db.collection('paidTweets').insertOne(paidTweet);
      
      console.log('Payment successful, created paid tweet entry:', {
        merchantRef: data.merchant_ref,
        hasMedia: !!mediaData,
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
