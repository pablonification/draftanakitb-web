import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { generateTweetNotification } from '@/app/utils/emailTemplate';
import nodemailer from 'nodemailer';

export async function POST(request, { params }) {  // Destructure params here
    try {
        const token = request.headers.get('authorization')?.split(' ')[1];
        if (!verifyToken(token)) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const tweetId = params.tweetId;  // Access from destructured params

        const { db } = await connectToDatabase();

        const tweet = await db.collection('paidTweets').findOne({ _id: tweetId });
        if (!tweet || !tweet.tweetUrl) {
            return NextResponse.json({ 
                success: false, 
                error: 'Tweet not found or URL not set' 
            }, { status: 404 });
        }

        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT,
            secure: false,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        });

        await transporter.sendMail({
            from: `"DraftAnakITB" <${process.env.MAIL_USER}>`,
            to: tweet.email,
            subject: 'Your Paid Menfess Has Been Posted! 🎉',
            html: generateTweetNotification(tweet.tweetUrl)
        });

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
            error: 'Failed to send notification' 
        }, { status: 500 });
    }
}