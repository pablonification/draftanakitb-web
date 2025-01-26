import { connectToDatabase } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function GET(request) {
    try {
        // Verify authentication
        const token = request.headers.get('Authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json({ success: false, error: 'No token provided' }, { status: 401 });
        }

        const verified = await verifyToken(token);
        if (!verified) {
            return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
        }

        // Connect to database using the connection pool
        const { db } = await connectToDatabase();

        // Fetch tweets
        const tweets = await db.collection('paidTweets')
            .find({})
            .sort({ createdAt: -1 })
            .toArray();

        console.log(`Found ${tweets.length} tweets`);

        return NextResponse.json({ 
            success: true, 
            tweets: tweets 
        });
    } catch (error) {
        console.error('Error in tweets route:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to fetch tweets',
            details: error.message 
        }, { status: 500 });
    }
}
