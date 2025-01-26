import { TwitterApi } from 'twitter-api-v2';

// Initialize Twitter client
const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

const twitterBearer = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);

export const twitterClientRW = twitterClient.readWrite;
export const twitterClientRO = twitterBearer.readOnly;
