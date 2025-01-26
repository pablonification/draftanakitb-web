/**
 * Bot limits configuration
 * GLOBAL_REGULAR_DAILY: Maximum number of regular menfess per day (Twitter API limit)
 * PERSONAL_REGULAR_DAYS: Days between regular menfess per user
 * PERSONAL_PAID_DAILY: Maximum number of paid menfess per user per day
 * GLOBAL_PAID_DAILY: Maximum number of paid menfess per day
 * MESSAGE_LENGTH: Maximum message length in characters
 * ATTACHMENT_SIZE: Maximum attachment size in MB
 */
export const LIMITS = {
  // Regular menfess limits
  GLOBAL_REGULAR_DAILY: 17,       // Twitter API limit per day
  PERSONAL_REGULAR_DAYS: 7,       // Days between regular menfess per user
  
  // Message limits
  MESSAGE_LENGTH: 280,           // Twitter character limit
  ATTACHMENT_SIZE: 1,           // Max file size in MB
  
  // Rate limiting
  OTP_COOLDOWN: 30,            // Seconds between OTP requests
  OTP_EXPIRY: 300,            // OTP expiry in seconds (5 minutes)
};

// Validation helpers
export const isWithinLimits = {
  personalRegular: (lastMessageDate) => {
    if (!lastMessageDate) return true;
    const daysDiff = Math.floor((new Date() - new Date(lastMessageDate)) / (1000 * 60 * 60 * 24));
    return daysDiff >= LIMITS.PERSONAL_REGULAR_DAYS;
  },
  
  globalRegular: (currentCount) => {
    return currentCount < LIMITS.GLOBAL_REGULAR_DAILY;
  },

  messageLength: (message) => {
    return message.length <= LIMITS.MESSAGE_LENGTH;
  },

  attachmentSize: (sizeInBytes) => {
    return (sizeInBytes / (1024 * 1024)) <= LIMITS.ATTACHMENT_SIZE;
  }
};
