import { connectDB } from '@/app/utils/db';
import { RegularTweet } from '@/app/models/regularTweetModel';
import { PaidTweet } from '@/app/models/paidTweetModel';
import { verifyToken } from '@/lib/auth';
import { NextResponse } from 'next/server';

export const DELETE = async (request, { params }) => {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ success: false, error: 'No token provided' }, { status: 401 });
    }

    const verified = await verifyToken(token);
    if (!verified) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    await connectDB();
    const type = await Promise.resolve(params.type); // Properly await params

    if (type === 'paid') {
      await PaidTweet.deleteMany({});
    } else if (type === 'regular') {
      await RegularTweet.deleteMany({});
    } else {
      throw new Error('Invalid tweet type');
    }

    return NextResponse.json({
      success: true,
      message: `All ${type} tweets cleared successfully`
    });
  } catch (error) {
    console.error('Error clearing tweets:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
};
