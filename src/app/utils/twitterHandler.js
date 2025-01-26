/* eslint-disable */
import { twitterClientRW } from './twitterClient';
import fs from 'fs';
import path from 'path';

// Post a tweet with or without an image
export const tweet = async (message, mediaBuffer, mediaType) => {
  try {
    let mediaId;
    
    if (mediaBuffer) {
      try {
        // Upload media using v1 endpoint (required for media upload)
        mediaId = await twitterClientRW.v1.uploadMedia(mediaBuffer, { 
          mimeType: mediaType 
        });
        console.log('Media uploaded successfully:', mediaId);
      } catch (mediaError) {
        console.error('Error uploading media:', mediaError);
        // Continue without media if upload fails
      }
    }

    // Create tweet with v2 endpoint
    const tweetData = {
      text: message,
    };

    // Add media if available
    if (mediaId) {
      tweetData.media = { media_ids: [mediaId] };
    }

    const result = await twitterClientRW.v2.tweet(tweetData);
    console.log('Tweet sent successfully:', result);
    return result;

  } catch (error) {
    console.error('Error in tweet function:', error);
    throw error;
  }
};
