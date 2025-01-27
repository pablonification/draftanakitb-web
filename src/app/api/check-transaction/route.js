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
        
        const transaction = await Transaction.findOne({ merchantRef: ref });
        
        console.log('Transaction Status:', {
            ref: ref,
            status: transaction?.status || 'NOT_FOUND',
            email: transaction?.email,
            amount: transaction?.amount
        });

        if (!transaction) {
            return NextResponse.json({ status: 'NOT_FOUND' });
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
