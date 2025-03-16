import mongoose from 'mongoose';

let isConnected = false;
let connectionAttempts = 0;
const MAX_RETRIES = 3;

// Utility for sleeping between retries
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const connectDB = async () => {
  if (isConnected) {
    console.log('Using existing MongoDB connection');
    return;
  }

  try {
    // Set connection options with timeouts
    const options = {
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 10000,
      retryWrites: true,
      retryReads: true,
      maxPoolSize: 10,
      minPoolSize: 5
    };

    // Retry logic for database connection
    while (connectionAttempts < MAX_RETRIES) {
      try {
        console.log(`MongoDB connection attempt ${connectionAttempts + 1}/${MAX_RETRIES}...`);
        
        await mongoose.connect(process.env.MONGODB_URI, options);
        
        isConnected = true;
        connectionAttempts = 0; // Reset for next time
        console.log('MongoDB connected successfully');
        return;
      } catch (connectionError) {
        connectionAttempts++;
        console.error(`MongoDB connection error (attempt ${connectionAttempts}/${MAX_RETRIES}):`, connectionError);
        
        if (connectionAttempts >= MAX_RETRIES) {
          throw connectionError; // Rethrow after max retries
        }
        
        // Exponential backoff: 1s, 2s, 4s
        const delayMs = Math.pow(2, connectionAttempts - 1) * 1000;
        console.log(`Retrying in ${delayMs}ms...`);
        await sleep(delayMs);
      }
    }
  } catch (error) {
    console.error('MongoDB connection failed after multiple retries:', error);
    
    // Clean up any lingering connections
    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      console.error('Error during mongoose disconnect:', disconnectError);
    }
    
    isConnected = false;
    throw new Error(`Database connection failed: ${error.message}`);
  }
};
