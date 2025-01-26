import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';

export async function DELETE(request, { params }) {
  try {
    const { tweetId } = params;
    const auth = await verifyToken(request);
    if (!auth.success) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const db = await connectToDatabase();
    const tweet = await db.collection('tweets').findOne({ _id: tweetId });
    
    if (!tweet) {
      return NextResponse.json({ success: false, error: 'Tweet not found' }, { status: 404 });
    }

    // Update the tweet to remove media URL
    await db.collection('tweets').updateOne(
      { _id: tweetId },
      { $unset: { mediaUrl: "" } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting media:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
