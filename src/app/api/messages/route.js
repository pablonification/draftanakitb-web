import { connectDB } from '@/app/utils/db';
import { User } from '@/app/models/userModel';
import { tweet } from '@/app/utils/twitterHandler';
import { NextResponse } from 'next/server';
import { DailyMessageCount } from '@/app/models/dailyMessageCount';
import { LIMITS, isWithinLimits } from '@/app/config/limits';

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
  
  const hasTriggerWord = triggerWords.some(word => message.toLowerCase().includes(word));
  
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

async function checkGlobalLimit() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dailyCount = await DailyMessageCount.findOne({ date: today });
  const currentCount = dailyCount?.regularCount || 0;
  
  return isWithinLimits.globalRegular(currentCount);
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
      return NextResponse.json({
        success: false,
        error: 'PERSONAL_LIMIT_EXCEEDED'
      });
    }

    // Then check global limit
    const canSendGlobal = await checkGlobalLimit();
    if (!canSendGlobal) {
      return NextResponse.json({
        success: false,
        error: 'GLOBAL_LIMIT_EXCEEDED'
      });
    }

    // If checks pass, proceed with message validation and sending
    try {
      validateMessage(message);
      
      let tweetResponse;
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
        }
        
        tweetResponse = await tweet(message, mediaBuffer, mediaType);
      }

      // Always update counters
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      await DailyMessageCount.findOneAndUpdate(
        { date: today },
        { $inc: { regularCount: 1 } },
        { upsert: true }
      );

      // Always update user's last message time
      await User.findOneAndUpdate(
        { email },
        { 
          $set: { lastRegularMessage: new Date() },
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
          globalLimitExceeded: !canSendGlobal
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
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dailyCount = await DailyMessageCount.findOne({ date: today });
    const currentCount = dailyCount?.regularCount || 0;
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