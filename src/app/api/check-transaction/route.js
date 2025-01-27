import { connectDB } from '@/app/utils/db';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function GET(request) {
    try {
        console.log('=== TRANSACTION STATUS CHECK ===');
        console.log('Timestamp:', new Date().toISOString());
        
        const { searchParams } = new URL(request.url);
        const ref = searchParams.get('ref');
        console.log('Checking Reference:', ref);

        if (!ref) {
            return NextResponse.json({ error: 'Missing reference' }, { status: 400 });
        }

        await connectDB();
        const Transaction = mongoose.models.Transaction;
        
        // More specific query to ensure we get the exact transaction
        const transaction = await Transaction.findOne({
            merchantRef: ref,
            status: { $ne: 'EXPIRED' } // Exclude expired transactions
        });
        
        console.log('Transaction Status:', {
            ref: ref,
            status: transaction?.status || 'NOT_FOUND',
            email: transaction?.email,
            amount: transaction?.amount,
            createdAt: transaction?.createdAt
        });

        if (!transaction) {
            return NextResponse.json({ status: 'NOT_FOUND' });
        }

        // Check if transaction is old and unpaid
        const now = new Date();
        const transactionAge = now - transaction.createdAt;
        if (transaction.status === 'UNPAID' && transactionAge > 30 * 60 * 1000) { // 30 minutes
            transaction.status = 'EXPIRED';
            await transaction.save();
            return NextResponse.json({ status: 'EXPIRED' });
        }

        return NextResponse.json({ status: transaction.status });

    } catch (error) {
        console.error('=== TRANSACTION CHECK ERROR ===');
        console.error('Timestamp:', new Date().toISOString());
        console.error('Error:', error);
        console.error('Stack:', error.stack);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
