import mongoose from 'mongoose';

const regularTweetSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  messageText: {
    type: String,
    required: true
  },
  mediaUrl: String,
  tweetId: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const RegularTweet = mongoose.models.RegularTweet || mongoose.model('RegularTweet', regularTweetSchema);
