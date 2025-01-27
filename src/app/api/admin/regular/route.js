import { connectDB } from '@/app/utils/db';
import { verifyToken } from '@/lib/auth';
import { RegularTweet } from '@/app/models/regularTweetModel';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ success: false, error: 'No token provided' }, { status: 401 });
    }

    const verified = await verifyToken(token);
    if (!verified) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    await connectDB();

    // Get the last 100 regular tweets, newest first
    const tweets = await RegularTweet.find()
      .sort({ createdAt: -1 })
      .limit(100);

    return NextResponse.json({ success: true, tweets });
  } catch (error) {
    console.error('Error fetching regular tweets:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
