import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function POST(request) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ success: false, error: 'Test endpoint only available in development' }, { status: 403 });
  }

  try {
    const menfessData = await request.json();
    const { db } = await connectToDatabase();

    const result = await db.collection('tweets').insertOne({
      email: menfessData.email,
      messageText: menfessData.message,
      type: 'paid',
      tweetStatus: 'pending',
      mediaUrl: menfessData.attachment || null,
      createdAt: new Date(),
      notificationSent: false
    });

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (error) {
    console.error('Test transaction error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
