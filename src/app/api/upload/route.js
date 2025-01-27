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

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export async function POST(request) {
  try {
    await connectDB();
    
    // Add request size logging
    const contentLength = request.headers.get('content-length');
    console.log('Upload request size:', {
      contentLength,
      sizeInMB: contentLength ? (parseInt(contentLength) / (1024 * 1024)).toFixed(2) + 'MB' : 'unknown'
    });

    const body = await request.json();
    
    // Additional validation
    if (!body.data) {
      console.error('Missing data in upload request');
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    if (!body.type || !body.type.match(/^(image|video)\//)) {
      console.error('Invalid media type:', body.type);
      return NextResponse.json({ error: 'Invalid media type' }, { status: 400 });
    }

    // Generate unique ID with timestamp and random string
    const mediaId = `media_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

    const media = new Media({
      id: mediaId,
      type: body.type,
      base64: body.data
    });

    await media.save();
    console.log('Media stored successfully:', { 
      mediaId, 
      type: body.type,
      size: body.data.length
    });

    return NextResponse.json({ 
      success: true, 
      mediaId,
      size: body.data.length
    });
    
  } catch (error) {
    console.error('Upload error:', {
      message: error.message,
      stack: error.stack
    });
    return NextResponse.json({ 
      error: 'Upload failed', 
      details: error.message 
    }, { 
      status: 500 
    });
  }
}
