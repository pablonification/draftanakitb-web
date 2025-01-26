/* eslint-disable */
import { TwitterApi } from 'twitter-api-v2';

// Initialize Twitter client with v2 credentials
const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
  // Add bearer token for v2 endpoints
  bearerToken: process.env.TWITTER_BEARER_TOKEN,
});

// Create a client for read-write operations
export const twitterClientRW = twitterClient;
// Create a client for read-only operations
export const twitterClientRO = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);
