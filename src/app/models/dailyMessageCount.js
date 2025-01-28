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

export const DailyMessageCount = mongoose.models.DailyMessageCount || 
  mongoose.model('DailyMessageCount', dailyMessageCountSchema);
