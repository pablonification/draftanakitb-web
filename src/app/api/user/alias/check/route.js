import { connectDB } from '@/app/utils/db';
import { User } from '@/app/models/userModel';
import { NextResponse } from 'next/server';

// Check if an alias is available (not already used by another user)
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const alias = searchParams.get('alias');
    
    if (!alias) {
      return NextResponse.json({ error: 'Alias is required' }, { status: 400 });
    }
    
    // Check if the alias is already in use by any user
    const existingUser = await User.findOne({ 
      alias: alias.trim(),
      // Ignore aliases that are just "Sender" or "SenderXXXX" (default ones)
      $nor: [
        { alias: /^Sender\d{4}$/ },
        { alias: 'Sender' }
      ]
    });
    
    return NextResponse.json({
      available: !existingUser,
      message: existingUser ? 'Alias is already in use' : 'Alias is available'
    });
  } catch (error) {
    console.error('Error checking alias availability:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 