import { connectDB } from '@/app/utils/db';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const ref = searchParams.get('ref');

        if (!ref) {
            return NextResponse.json({ error: 'Missing reference' }, { status: 400 });
        }

        await connectDB();
        const Transaction = mongoose.models.Transaction;
        
        const transaction = await Transaction.findOne({ merchantRef: ref });
        
        if (!transaction) {
            return NextResponse.json({ status: 'NOT_FOUND' });
        }

        return NextResponse.json({ status: transaction.status });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
