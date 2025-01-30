import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { verifyToken } from '@/lib/auth';
import { generateTweetNotification } from '@/app/utils/emailTemplate';
import mailSender from '@/app/utils/mailSender';

export async function POST(request, { params }) {
    try {
        const token = request.headers.get('authorization')?.split(' ')[1];
        if (!verifyToken(token)) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const tweetId = params.tweetId;

        // Connect to MongoDB using mongoose
        if (!mongoose.connections[0].readyState) {
            await mongoose.connect(process.env.MONGODB_URI);
        }

        const db = mongoose.connection.db;

        const tweet = await db.collection('paidTweets').findOne({ _id: tweetId });
        if (!tweet || !tweet.tweetUrl) {
            return NextResponse.json({ 
                success: false, 
                error: 'Tweet not found or URL not set' 
            }, { status: 404 });
        }

        // Pass the entire tweet object to the template
        await mailSender(
            tweet.email,
            'Your Paid Menfess Has Been Posted! ✨',
            generateTweetNotification(tweet.tweetUrl, tweet)
        );

        await db.collection('paidTweets').updateOne(
            { _id: tweetId },
            { $set: { notificationSent: true, notifiedAt: new Date() } }
        );

        return NextResponse.json({ 
            success: true, 
            message: 'Notification sent successfully' 
        });
    } catch (error) {
        console.error('Error sending notification:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to send notification: ' + error.message 
        }, { status: 500 });
    }
}