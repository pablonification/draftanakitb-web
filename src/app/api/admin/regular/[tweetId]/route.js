import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';

export async function DELETE(request, { params }) {
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
        const tweetId = params.tweetId;

        const result = await db.collection('regularTweets').deleteOne({ _id: tweetId });

        if (result.deletedCount === 0) {
            return NextResponse.json({ 
                success: false, 
                error: 'Tweet not found' 
            }, { status: 404 });
        }

        return NextResponse.json({ 
            success: true, 
            message: 'Tweet deleted successfully' 
        });
    } catch (error) {
        console.error('Error deleting tweet:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to delete tweet' 
        }, { status: 500 });
    }
} 