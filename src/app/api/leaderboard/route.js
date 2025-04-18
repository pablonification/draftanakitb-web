import { NextResponse } from 'next/server';
import { connectDB } from '@/app/utils/db';
import { User } from '@/app/models/userModel';

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'all-time'; // 'all-time', 'weekly', 'monthly'
    
    // Tanggal untuk filter
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'weekly':
        // Awal minggu ini (Senin)
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'monthly':
        // Awal bulan ini
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        // All time - tidak perlu filter tanggal
        startDate = null;
    }
    
    // Query dasar untuk mendapatkan user yang ingin ditampilkan di leaderboard
    const query = { showInLeaderboard: true, messageCount: { $gt: 0 } };
    
    // Tambahkan filter tanggal jika diperlukan
    if (startDate) {
      query.lastActive = { $gte: startDate };
    }
    
    // Dapatkan data dan urutkan
    const users = await User.find(query)
      .select('alias messageCount -_id')
      .sort({ messageCount: -1 })
      .limit(20); // Hanya ambil 20 teratas
    
    // Tambahkan ranking
    const leaders = users.map((user, index) => ({
      rank: index + 1,
      alias: user.alias,
      messageCount: user.messageCount
    }));
    
    return NextResponse.json({
      success: true,
      leaders,
      period
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ 
      error: 'Server error', 
      details: error.message 
    }, { status: 500 });
  }
} 
 
 