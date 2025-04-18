import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  alias: {
    type: String,
    default: "Sender", 
    trim: true,
    maxlength: 20 // Batasi panjang alias
  },
  messageCount: {
    type: Number,
    default: 0
  },
  showInLeaderboard: {
    type: Boolean,
    default: true // Default tampilkan di leaderboard
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  lastRegularMessage: {
    type: Date,
    default: null
  }
});

// Add method to check personal limit
userSchema.statics.canSendRegularMessage = function(user, daysLimit) {
  if (!user.lastRegularMessage) return true;
  
  const daysSinceLastMessage = Math.floor(
    (new Date() - new Date(user.lastRegularMessage)) / (1000 * 60 * 60 * 24)
  );
  
  return daysSinceLastMessage >= daysLimit;
};

// Clean up existing models before creating new one
mongoose.models = {};

export const User = mongoose.models.User || mongoose.model('User', userSchema);
