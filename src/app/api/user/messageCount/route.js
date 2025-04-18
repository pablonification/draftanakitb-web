import { NextResponse } from 'next/server';
import { connectDB } from '@/app/utils/db';
import { User } from '@/app/models/userModel';

// Update messageCount
export async function PUT(request) {
  try {
    await connectDB();
    
    const data = await request.json();
    const { email, increment = 1 } = data;
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    
    // Increment messageCount and update lastActive
    const updatedUser = await User.findOneAndUpdate(
      { email },
      { 
        $inc: { messageCount: increment },
        $set: { lastActive: new Date() },
        $setOnInsert: { email }
      },
      { 
        new: true,
        upsert: true
      }
    );
    
    return NextResponse.json({
      success: true,
      messageCount: updatedUser.messageCount
    });
  } catch (error) {
    console.error('Error updating message count:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// Get messageCount
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    
    const user = await User.findOne({ email }).select('messageCount -_id');
    
    if (!user) {
      return NextResponse.json({ 
        success: true,
        messageCount: 0
      });
    }
    
    return NextResponse.json({
      success: true,
      messageCount: user.messageCount
    });
  } catch (error) {
    console.error('Error getting message count:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 
 
 