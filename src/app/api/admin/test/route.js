import { connectDB } from '@/app/utils/db';
import { RegularTweet } from '@/app/models/regularTweetModel';
import { PaidTweet } from '@/app/models/paidTweetModel'; // Add this import
import { verifyToken } from '@/lib/auth';
import { NextResponse } from 'next/server';

const DUMMY_REGULAR_TWEETS = [
  {
    email: "test1@mahasiswa.itb.ac.id",
    messageText: "itb! Halo semuanya, ada yang punya tips kuliah di ITB? 😊",
    tweetId: "dummy1",
    createdAt: new Date(),
  },
  {
    email: "test2@mahasiswa.itb.ac.id",
    messageText: "bucin! sender kangen banget sama kamu, udah 3 hari ga ketemu 😭",
    tweetId: "dummy2",
    createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
  },
  {
    email: "test3@mahasiswa.itb.ac.id",
    messageText: "maba! Kapan ya terbiasa sama irama kuliah di ITB? 🥺",
    tweetId: "dummy3",
    createdAt: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
  },
  {
    email: "test4@mahasiswa.itb.ac.id",
    messageText: "itbparkir! ada yang tau parkiran motor di sekret wisentra ga?",
    tweetId: "dummy4",
    createdAt: new Date(Date.now() - 1000 * 60 * 15),
  },
  {
    email: "test5@mahasiswa.itb.ac.id",
    messageText: "misuh! duhh capek banget hari ini praktikum dari pagi 😫",
    tweetId: "dummy5",
    createdAt: new Date(Date.now() - 1000 * 60 * 20),
  },
  {
    email: "test6@mahasiswa.itb.ac.id",
    messageText: "itb! Ada yang tau jadwal konsul dosen X kah?",
    tweetId: "dummy6",
    createdAt: new Date(Date.now() - 1000 * 60 * 25),
  },
  {
    email: "test7@mahasiswa.itb.ac.id",
    messageText: "bucin! Sender gatau kenapa makin kesini makin sayang sama kamu 💕",
    tweetId: "dummy7",
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    email: "test8@mahasiswa.itb.ac.id",
    messageText: "maba! Masih bingung cara pake CIS nih, help 😅",
    tweetId: "dummy8",
    createdAt: new Date(Date.now() - 1000 * 60 * 35),
  },
  {
    email: "test9@mahasiswa.itb.ac.id",
    messageText: "itb! Ada yang udah ambil mata kuliah Y? Worth it gak ya?",
    tweetId: "dummy9",
    createdAt: new Date(Date.now() - 1000 * 60 * 40),
  },
  {
    email: "test10@mahasiswa.itb.ac.id",
    messageText: "misuh! Kenapa sih nilai praktikum selalu telat keluar 😤",
    tweetId: "dummy10",
    createdAt: new Date(Date.now() - 1000 * 60 * 45),
  }
];

export async function POST(request) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ success: false, error: 'No token provided' }, { status: 401 });
    }

    const verified = await verifyToken(token);
    if (!verified) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    const { type = 'paid' } = await request.json().catch(() => ({}));
    
    await connectDB();
    
    if (type === 'regular') {
      // Clear existing test data first
      await RegularTweet.deleteMany({});
      const regularTweets = await RegularTweet.insertMany(DUMMY_REGULAR_TWEETS);
      return NextResponse.json({
        success: true,
        message: 'Added dummy regular tweets',
        insertedCount: regularTweets.length
      });
    }

    // Handle paid tweets
    await PaidTweet.deleteMany({});

    // Create 10 test tweets with proper schema
    const testTweets = Array.from({ length: 10 }, (_, i) => ({
      senderID: i + 1, // Changed to number format
      email: `1822304${i + 1}@mahasiswa.itb.ac.id`,
      messageText: `Test tweet #${i + 1} with random message #DraftAnakITB ${Math.random().toString(36).substring(7)}`,
      mediaUrl: `https://picsum.photos/400/300?random=${i}`,
      mediaType: i % 2 === 0 ? "image" : "video",
      tweetStatus: "pending",
      createdAt: new Date(Date.now() - (i * 60000)),
      paymentStatus: "completed",
      paymentAmount: 5000,
      notificationSent: false,
      scheduledTime: `${(20 + Math.floor(i/2)).toString().padStart(2, '0')}:${(i * 6).toString().padStart(2, '0')}`,
      paymentID: i + 1 // Changed to number format if required
    }));

    const insertResult = await PaidTweet.insertMany(testTweets);

    return NextResponse.json({ 
      success: true, 
      message: 'Added 10 test tweets and cleared stats',
      insertedCount: insertResult.length,
      insertedIds: insertResult.map(doc => doc._id)
    });

  } catch (error) {
    console.error('Error in test route:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to add test data',
      details: error.message 
    }, { status: 500 });
  }
}
