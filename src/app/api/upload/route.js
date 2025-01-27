import { NextResponse } from 'next/server';
import { connectDB } from '@/app/utils/db';
import mongoose from 'mongoose';

const MediaSchema = new mongoose.Schema({
  id: String,
  type: String,
  base64: String,
  createdAt: { type: Date, default: Date.now }
});

const Media = mongoose.models.Media || mongoose.model('Media', MediaSchema);

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    console.log('Received upload request:', {
      hasData: !!body.data,
      dataLength: body.data?.length,
      type: body.type
    });

    if (!body.data || !body.type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate unique ID
    const mediaId = 'media_' + Date.now();

    // Store media data
    const media = new Media({
      id: mediaId,
      type: body.type,
      base64: body.data
    });

    await media.save();
    console.log('Media stored successfully:', { mediaId, type: body.type });

    return NextResponse.json({ success: true, mediaId });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
