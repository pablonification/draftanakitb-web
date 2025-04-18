import { NextResponse } from 'next/server';
import { connectDB } from '@/app/utils/db';
import { User } from '@/app/models/userModel';

// Helper function to validate alias
const validateAlias = (alias) => {
  // Validasi panjang
  if (!alias || alias.length > 20) {
    return false;
  }
  
  // Validasi kata terlarang
  const forbiddenWords = ["admin", "moderator", "draftanakitb", "admin_itb", "rektor", "dekan"];
  if (forbiddenWords.some(word => alias.toLowerCase().includes(word))) {
    return false;
  }
  
  return true;
};

// Update alias
export async function PUT(request) {
  try {
    await connectDB();
    
    const data = await request.json();
    const { email, alias, showInLeaderboard } = data;
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    
    // Jika alias kosong, gunakan default "Sender"
    const aliasToUse = alias?.trim() || "Sender";
    
    // Validasi alias
    if (!validateAlias(aliasToUse)) {
      return NextResponse.json({ error: 'Alias tidak valid' }, { status: 400 });
    }
    
    // Update user
    const updatedUser = await User.findOneAndUpdate(
      { email },
      { 
        alias: aliasToUse,
        showInLeaderboard: showInLeaderboard !== undefined ? showInLeaderboard : true,
        lastActive: new Date()
      },
      { new: true }
    );
    
    if (!updatedUser) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      alias: updatedUser.alias,
      showInLeaderboard: updatedUser.showInLeaderboard
    });
  } catch (error) {
    console.error('Error updating alias:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// Get alias
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    
    const user = await User.findOne({ email }).select('alias showInLeaderboard messageCount');
    
    if (!user) {
      return NextResponse.json({ 
        success: true,
        alias: "Sender", // Default alias for new users
        showInLeaderboard: true,
        messageCount: 0,
        hasCustomAlias: false
      });
    }
    
    // Check if user has set a custom alias or is still using the default
    const hasCustomAlias = user.alias && user.alias !== "Sender";
    
    return NextResponse.json({
      success: true,
      alias: user.alias || "Sender",
      showInLeaderboard: user.showInLeaderboard,
      messageCount: user.messageCount,
      hasCustomAlias: hasCustomAlias
    });
  } catch (error) {
    console.error('Error getting alias:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 