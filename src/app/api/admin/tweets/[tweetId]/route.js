import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function PUT(request, { params }) {
    try {
        const token = request.headers.get('Authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json({ success: false, error: 'No token provided' }, { status: 401 });
        }

        const verified = await verifyToken(token);
        if (!verified) {
            return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
        }

        const { db } = await connectToDatabase();
        const { status, tweetUrl } = await request.json();
        const tweetId = params.tweetId;

        // Include admin name when updating tweet status
        const updateData = {
            tweetStatus: status,
            ...(tweetUrl && { tweetUrl }),
            ...(status === 'posted' && { 
                postedBy: verified.name,
                postedAt: new Date()
            })
        };

        const result = await db.collection('paidTweets').updateOne(
            { _id: tweetId },
            { $set: updateData }
        );

        if (result.modifiedCount === 0) {
            return NextResponse.json({ 
                success: false, 
                error: 'Tweet not found or not modified' 
            }, { status: 404 });
        }

        // Update admin stats if tweet is posted
        if (status === 'posted') {
            await db.collection('adminStats').updateOne(
                { adminName: verified.name },
                { 
                    $inc: { tweetsPosted: 1 },
                    $set: { lastUpdated: new Date() }
                },
                { upsert: true }
            );
        }

        return NextResponse.json({ 
            success: true, 
            message: 'Tweet status updated successfully' 
        });
    } catch (error) {
        console.error('Error updating tweet:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to update tweet status' 
        }, { status: 500 });
    }
}
