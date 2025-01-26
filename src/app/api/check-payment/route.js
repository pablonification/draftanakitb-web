import { NextResponse } from 'next/server';
import axios from 'axios';
import { connectDB } from '@/app/utils/db';
import mongoose from 'mongoose';

// Define Transaction schema here to avoid Next.js module issues
const transactionSchema = new mongoose.Schema({
  merchantRef: {
    type: String,
    required: true,
    unique: true
  },
  email: String,
  message: String,
  attachment: String,
  amount: Number,
  status: {
    type: String,
    enum: ['UNPAID', 'PAID', 'EXPIRED', 'FAILED'],
    default: 'UNPAID'
  },
  paidAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Initialize the model
const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);

export async function POST(request) {
  try {
    await connectDB();
    const { merchantRef } = await request.json();
    const apiKey = "DEV-oStxvQXw3iNxvviRptEMBGfCMFxJllfyIMHaXVto";

    // First check our database
    const transaction = await Transaction.findOne({ merchantRef });
    
    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // If already marked as paid in our database, return that status
    if (transaction.status === 'PAID') {
      return NextResponse.json({
        success: true,
        status: 'PAID'
      });
    }

    // Otherwise check with TriPay
    const response = await axios.get(
      `https://tripay.co.id/api-sandbox/transaction/detail`,
      {
        params: {
          reference: merchantRef
        },
        headers: {
          'Authorization': 'Bearer ' + apiKey
        }
      }
    );

    const status = response.data.data.status;

    // Update our database if payment is completed
    if (status === 'PAID' && transaction.status !== 'PAID') {
      transaction.status = 'PAID';
      transaction.paidAt = new Date();
      await transaction.save();
    }

    return NextResponse.json({
      success: true,
      status: status,
      amount: response.data.data.amount,
      paidAt: response.data.data.paid_at
    });

  } catch (error) {
    console.error('Payment check error:', error.response?.data || error);
    return NextResponse.json(
      { 
        error: 'Failed to check payment status',
        details: error.response?.data || error.message 
      },
      { status: 500 }
    );
  }
}
