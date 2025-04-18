import { connectDB } from '@/app/utils/db';
import { User } from '@/app/models/userModel';
import { tweet } from '@/app/utils/twitterHandler';
import { NextResponse } from 'next/server';
import { DailyMessageCount } from '@/app/models/dailyMessageCount';
import { LIMITS, isWithinLimits } from '@/app/config/limits';
import { RegularTweet } from '@/app/models/regularTweetModel';

// Mock tweet function for development
const mockTweet = async (message, attachment) => {
  console.log('🚀 DEV MODE: Tweet would be sent with following content:');
  console.log('Message:', message);
  console.log('Attachment:', attachment ? 'Image attached' : 'No attachment');
  return {
    data: {
      id: 'mock-tweet-' + Date.now(),
      text: message
    }
  };
};

function validateMessage(message) {
  const triggerWords = ['itb!', 'maba!', 'misuh!', 'bucin!', 'itbparkir!'];
  
  // Convert message to lowercase for case-insensitive comparison
  const lowerMessage = message.toLowerCase().trim();
  
  // Check if message contains any of the trigger words
  const hasTriggerWord = triggerWords.some(word => lowerMessage.includes(word));
  
  if (!hasTriggerWord) {
    throw new Error('Pesan harus mengandung salah satu trigger word berikut: itb!, maba!, misuh!, bucin!, atau itbparkir!');
  }
  
  if (!isWithinLimits.messageLength(message)) {
    throw new Error(`Message must not exceed ${LIMITS.MESSAGE_LENGTH} characters`);
  }
}

async function checkPersonalLimit(email) {
  const user = await User.findOne({ email });
  if (!user) return true;

  const lastMessage = user.lastRegularMessage;
  return isWithinLimits.personalRegular(lastMessage);
}

async function getDailyMessageCount() {
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000;
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const dailyCount = await DailyMessageCount.findOne({ date: today });
      
      // Validate the count value
      const count = dailyCount?.regularCount || 0;
      if (typeof count !== 'number' || isNaN(count)) {
        throw new Error('Invalid count value retrieved from database');
      }

      return count;
    } catch (error) {
      retries++;
      console.error(`Error fetching daily count (attempt ${retries}/${MAX_RETRIES}):`, error);
      
      if (retries < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * retries));
        continue;
      }
      
      // If all retries fail, return a safe default
      console.error('All retries failed for daily count. Using fallback value.');
      return LIMITS.GLOBAL_REGULAR_DAILY; // Conservative approach: assume limit reached
    }
  }
}

async function checkGlobalLimit() {
  const currentCount = await getDailyMessageCount();
  // Add 1 to account for the current message being sent
  return isWithinLimits.globalRegular(currentCount + 1);
}

export async function POST(request) {
  try {
    await connectDB();
    const { email, message, attachment, type } = await request.json();

    // Skip limits for paid messages
    if (type === 'paid') {
      return NextResponse.json({ success: true });
    }

    // Check personal limit first
    const canSendPersonal = await checkPersonalLimit(email);
    if (!canSendPersonal) {
      const user = await User.findOne({ email });
      const lastMessageDate = new Date(user.lastRegularMessage);
      const nextAvailable = new Date(lastMessageDate);
      nextAvailable.setDate(lastMessageDate.getDate() + LIMITS.PERSONAL_REGULAR_DAYS);
      
      return NextResponse.json({
        success: false,
        error: 'PERSONAL_LIMIT_EXCEEDED',
        nextAvailable: nextAvailable.toISOString()
      });
    }

    // Then check global limit with improved handling
    let currentCount;
    try {
      currentCount = await getDailyMessageCount();
    } catch (error) {
      console.error('Failed to get daily count, enforcing limit:', error);
      return NextResponse.json({
        success: false,
        error: 'GLOBAL_LIMIT_CHECK_FAILED'
      });
    }

    // Check if adding this message would exceed the limit
    if (currentCount >= LIMITS.GLOBAL_REGULAR_DAILY) {
      return NextResponse.json({
        success: false,
        error: 'GLOBAL_LIMIT_EXCEEDED'
      });
    }

    // If checks pass, proceed with message validation and sending
    try {
      validateMessage(message);
      
      let tweetResponse;
      let mediaUrl = null;

      if (process.env.DEV_MODE === 'true') {
        tweetResponse = await mockTweet(message, attachment);
      } else {
        // Handle real tweet sending
        let mediaBuffer = null;
        let mediaType = null;

        if (attachment) {
          const [mimeTypeHeader, base64Data] = attachment.split(',');
          mediaType = mimeTypeHeader.split(':')[1].split(';')[0];
          mediaBuffer = Buffer.from(base64Data, 'base64');
          mediaUrl = attachment; // Store the base64 image
        }
        
        tweetResponse = await tweet(message, mediaBuffer, mediaType);
      }

      // Log regular tweet with consistent structure
      await RegularTweet.create({
        email,
        messageText: message,
        mediaUrl,
        tweetId: tweetResponse.data?.id,
        createdAt: new Date() // Explicitly set creation date
      });

      // Always update counters
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let updateSuccess = false;
      let updateRetries = 0;
      while (!updateSuccess && updateRetries < 3) {
        try {
          const updatedCount = await DailyMessageCount.findOneAndUpdate(
            { date: today },
            { $inc: { regularCount: 1 } },
            { 
              upsert: true,
              new: true,
              runValidators: true
            }
          );

          // Double-check the count after update
          if (updatedCount.regularCount > LIMITS.GLOBAL_REGULAR_DAILY) {
            console.error('Count exceeded limit after update:', updatedCount.regularCount);
            // Rollback the increment if needed
            await DailyMessageCount.updateOne(
              { date: today },
              { $inc: { regularCount: -1 } }
            );
            return NextResponse.json({
              success: false,
              error: 'GLOBAL_LIMIT_EXCEEDED'
            });
          }

          updateSuccess = true;
        } catch (error) {
          updateRetries++;
          console.error(`Failed to update daily count (attempt ${updateRetries}/3):`, error);
          if (updateRetries < 3) {
            await new Promise(resolve => setTimeout(resolve, 1000 * updateRetries));
          }
        }
      }

      if (!updateSuccess) {
        console.error('Failed to update daily count after all retries');
        // Continue anyway since the tweet was sent
      }

      // Always update user's last message time and increment message count
      await User.findOneAndUpdate(
        { email },
        { 
          $set: { 
            lastRegularMessage: new Date(),
            lastActive: new Date()
          },
          $inc: { messageCount: 1 },
          $setOnInsert: { email }
        },
        { upsert: true }
      );

      return NextResponse.json({
        success: true,
        message: process.env.DEV_MODE === 'true' ? 'Message logged (DEV MODE)' : 'Message sent successfully',
        tweetId: tweetResponse.data?.id,
        limitStatus: {
          personalLimitExceeded: !canSendPersonal,
          globalLimitExceeded: currentCount >= LIMITS.GLOBAL_REGULAR_DAILY
        }
      });

    } catch (tweetError) {
      console.error('Error sending tweet:', tweetError);
      return NextResponse.json(
        { success: false, error: tweetError.message },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

// Add new endpoint to get bot status
export async function GET() {
  try {
    await connectDB();
    
    let currentCount;
    try {
      currentCount = await getDailyMessageCount();
    } catch (error) {
      console.error('Error getting daily count for status:', error);
      currentCount = LIMITS.GLOBAL_REGULAR_DAILY; // Conservative fallback
    }

    const remainingCount = LIMITS.GLOBAL_REGULAR_DAILY - currentCount;
    const isPaidOnly = remainingCount <= 0;

    return NextResponse.json({
      status: 'ON',
      isPaidOnly,
      remainingRegular: Math.max(0, remainingCount),
      limits: LIMITS,
      currentUsage: {
        globalRegular: currentCount
      }
    });
  } catch (error) {
    console.error('Error getting bot status:', error);
    return NextResponse.json(
      { 
        status: 'ERROR', 
        error: error.message,
        isPaidOnly: true,
        remainingRegular: 0
      }, 
      { status: 500 }
    );
  }
}
