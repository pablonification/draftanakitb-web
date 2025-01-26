import { connectToDatabase } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function POST(request) {
    try {
        // Verify authentication token
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
        
        console.log('Connected to database successfully');

        // First, delete ALL test tweets
        const deleteResult = await db.collection('paidTweets').deleteMany({});
        console.log('Deleted all tweets:', deleteResult);

        // Create 10 test tweets
        const timestamp = new Date().getTime();
        const testTweets = Array.from({ length: 10 }, (_, i) => ({
            _id: `test_${timestamp}_${i + 1}`,
            email: `1822304${i + 1}@mahasiswa.itb.ac.id`,
            messageText: `Test tweet #${i + 1} with random message #DraftAnakITB ${Math.random().toString(36).substring(7)}`,
            mediaUrl: `https://picsum.photos/400/300?random=${i}`,
            mediaType: i % 2 === 0 ? "image" : "video",
            tweetStatus: "pending",
            createdAt: new Date(Date.now() - (i * 60000)), // Space them out by 1 minute
            paymentStatus: "completed",
            paymentAmount: 5000,
            notificationSent: false,
            scheduledTime: `${(20 + Math.floor(i/2)).toString().padStart(2, '0')}:${(i * 6).toString().padStart(2, '0')}`
        }));

        const insertResult = await db.collection('paidTweets').insertMany(testTweets);
        console.log('Inserted test tweets:', insertResult);

        // Also clear admin stats
        await db.collection('adminStats').deleteMany({});
        console.log('Cleared admin stats');

        return NextResponse.json({ 
            success: true, 
            message: 'Added 10 test tweets and cleared stats',
            insertedCount: insertResult.insertedCount,
            insertedIds: insertResult.insertedIds
        });
    } catch (error) {
        console.error('Error in test route:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to add test data',
            details: error.message 
        }, { status: 500 });
    }
}
