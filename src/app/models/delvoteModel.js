import mongoose from 'mongoose';

const DelVoteSchema = new mongoose.Schema({
  twitterUrl: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
  },
  reason: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  // Add a random field to make each document unique in dev mode
  uniqueId: {
    type: String,
    default: () => {
      // Check if we're in dev mode
      if (process.env.DEV_MODE === 'true') {
        // Generate random string as uniqueId
        return Date.now() + '-' + Math.random().toString(36).substring(2, 15);
      }
      // In production, this field is just empty
      return '';
    }
  }
});

// Create compound index to prevent duplicate votes
// But in dev mode, the uniqueId makes each document unique anyway
DelVoteSchema.index({ twitterUrl: 1, email: 1, uniqueId: 1 }, { unique: true });

export const DelVoteModel = mongoose.models.DelVote || mongoose.model('DelVote', DelVoteSchema); 
 
 