import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { GridFSBucket, ObjectId } from 'mongodb';

export async function DELETE(request) {
  try {
    // Get tweetId from URL
    const tweetId = request.nextUrl.pathname.split('/').pop();
    console.log('Processing delete request for tweet:', tweetId);

    // Auth verification
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ 
        success: false, 
        error: 'No token provided' 
      }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const verified = await verifyToken(token);
    if (!verified) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid token' 
      }, { status: 401 });
    }

    // Connect to database
    const { db } = await connectToDatabase();
    
    // Use paidTweets collection instead of tweets
    const paidTweets = db.collection('paidTweets');

    // Debug the collections in the database
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));

    // Find tweet and check media
    console.log('Looking up tweet in paidTweets collection:', tweetId);
    const tweet = await paidTweets.findOne({ 
      _id: tweetId,
      tweetStatus: 'posted'
    });

    console.log('Tweet lookup result:', tweet ? 'Found' : 'Not found');
    if (tweet) {
      console.log('Tweet data:', {
        id: tweet._id,
        status: tweet.tweetStatus,
        hasMedia: !!tweet.mediaUrl
      });
    }

    if (!tweet) {
      return NextResponse.json({ 
        success: false, 
        error: 'Tweet not found or not in posted status' 
      }, { status: 404 });
    }

    if (!tweet.mediaUrl) {
      return NextResponse.json({ 
        success: false, 
        error: 'No media found for this tweet' 
      }, { status: 404 });
    }

    // Handle media deletion
    if (tweet.mediaUrl.includes('api/files/')) {
      try {
        const bucket = new GridFSBucket(db);
        const fileId = tweet.mediaUrl.split('/').pop();
        console.log('Attempting to delete GridFS file:', fileId);
        await bucket.delete(new ObjectId(fileId));
        console.log('GridFS file deleted successfully');
      } catch (fileError) {
        console.error('Error deleting GridFS file:', fileError);
        // Continue with tweet update even if file deletion fails
      }
    }

    // Update tweet record
    const result = await paidTweets.updateOne(
      { _id: tweetId },
      { 
        $unset: { mediaUrl: "" },
        $set: { 
          mediaDeleted: true,
          mediaDeletionDate: new Date()
        }
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to update tweet record' 
      }, { status: 500 });
    }

    console.log('Successfully cleaned up media for tweet:', tweetId);
    return NextResponse.json({ 
      success: true, 
      message: 'Media deleted successfully' 
    });

  } catch (error) {
    console.error('Error in media deletion process:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
