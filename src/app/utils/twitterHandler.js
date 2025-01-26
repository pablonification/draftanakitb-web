import { twitterClientRW } from './twitterClient';
import fs from 'fs';
import path from 'path';

// Post a tweet with or without an image
export const tweet = async (message, mediaBuffer, mediaType) => {
  try {
    let mediaId;
    
    if (mediaBuffer) {
      try {
        // Upload media with type information
        const mediaResponse = await twitterClientRW.v1.uploadMedia(mediaBuffer, {
          mimeType: mediaType,
          target: 'tweet'
        });
        mediaId = mediaResponse;
      } catch (mediaError) {
        console.error('Error uploading media:', mediaError);
        // Continue without media if upload fails
      }
    }

    // Post tweet with or without media
    const tweetParams = {
      text: message,
      ...(mediaId && { media: { media_ids: [mediaId] } })
    };

    return await twitterClientRW.v2.tweet(tweetParams); 
  } catch (error) {
    console.error('Error in tweet function:', error);
    throw error;
  }
};
