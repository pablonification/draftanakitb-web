import mongoose from 'mongoose';

const dailyMessageCountSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true
  },
  regularCount: {
    type: Number,
    default: 0
  }
});

// Add method to check global limit
dailyMessageCountSchema.statics.hasReachedGlobalLimit = async function(limit) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const count = await this.findOne({ date: today });
  return count?.regularCount >= limit;
};

export const DailyMessageCount = mongoose.models.DailyMessageCount || 
  mongoose.model('DailyMessageCount', dailyMessageCountSchema);
