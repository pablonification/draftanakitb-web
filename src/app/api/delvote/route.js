import { NextResponse } from 'next/server';
import { connectDB } from '@/app/utils/db';
import { DelVoteModel } from '@/app/models/delvoteModel';
import { User } from '@/app/models/userModel';
import mailSender from '@/app/utils/mailSender';

// Whitelist constant at the top (sama dengan di page.js)
const WHITELISTED_EMAILS = ['arqilasp@gmail.com', 'drafanakitb.dev@gmail.com', 'zatworkspace@gmail.com', 'arqilasp13@gmail.com'];

// Dev mode setting - when true, email validation will be relaxed and duplicate votes allowed
const DEV_MODE = process.env.DEV_MODE === 'true';

// Helper function to validate email
const validateEmail = (email) => {
  // In dev mode, accept any email
  if (DEV_MODE) {
    console.log('DEV MODE: Email validation bypassed');
    return true;
  }
  
  // Allow whitelisted emails to bypass the validation
  if (WHITELISTED_EMAILS.includes(email)) {
    return true;
  }
  return email.endsWith('@mahasiswa.itb.ac.id');
};

// Helper function to count votes for a tweet
async function countVotesForTweet(twitterUrl) {
  try {
    const count = await DelVoteModel.countDocuments({ twitterUrl });
    return count;
  } catch (error) {
    console.error('Error counting votes:', error);
    return 0;
  }
}

// Helper function to clean up old votes that haven't reached threshold
async function cleanupOldVotes() {
  try {
    const VOTE_THRESHOLD = 10;
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    // In dev mode, use a shorter timeframe for testing (5 minutes)
    if (DEV_MODE) {
      oneDayAgo.setMinutes(oneDayAgo.getMinutes() - 5);
      console.log('DEV MODE: Using 5 minute cleanup period instead of 24 hours');
    }
    
    // Get all unique twitterUrls with votes
    const uniqueUrls = await DelVoteModel.distinct('twitterUrl');
    
    let cleanedCount = 0;
    
    // Check each URL
    for (const url of uniqueUrls) {
      const count = await DelVoteModel.countDocuments({ twitterUrl: url });
      
      // If votes count is less than threshold
      if (count < VOTE_THRESHOLD) {
        // Check if oldest vote is older than 1 day (or 5 minutes in dev mode)
        const oldestVote = await DelVoteModel.findOne({ twitterUrl: url }).sort({ createdAt: 1 });
        
        if (oldestVote && oldestVote.createdAt < oneDayAgo) {
          // Delete all votes for this URL
          await DelVoteModel.deleteMany({ twitterUrl: url });
          cleanedCount++;
        }
      }
    }
    
    console.log(`Cleaned up votes for ${cleanedCount} tweets that didn't reach threshold in ${DEV_MODE ? '5 minutes' : '24 hours'}`);
    return cleanedCount;
  } catch (error) {
    console.error('Error cleaning up old votes:', error);
    return 0;
  }
}

// Helper function to send notification email to admin
async function sendAdminNotification(twitterUrl, votes) {
  const VOTE_THRESHOLD = 10;
  
  // Only send if threshold is reached
  if (votes < VOTE_THRESHOLD) return;
  
  try {
    // Get all voters' emails and reasons
    const voters = await DelVoteModel.find({ twitterUrl }).select('email reason createdAt');
    
    // Generate confirmation token (simple hash of URL)
    const confirmationToken = Buffer.from(twitterUrl).toString('base64');
    const confirmationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://draftanakitb.tech'}/api/delvote?token=${confirmationToken}&url=${encodeURIComponent(twitterUrl)}`;
    
    // If in dev mode, use different email for testing
    const adminEmail = DEV_MODE ? process.env.DEV_ADMIN_EMAIL || 'draftanakitb.dev@gmail.com' : 'draftanakitb.dev@gmail.com';
    
    // Format date function
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleString('id-ID', { 
        dateStyle: 'medium', 
        timeStyle: 'short',
        hour12: false
      });
    };
    
    // Email content
    const emailSubject = '🚨 Permintaan Penghapusan Tweet | Draft Anak ITB';
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #d32f2f;">Permintaan Penghapusan Tweet</h2>
        <p>Sebuah tweet telah mendapatkan ${votes} vote untuk dihapus:</p>
        
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p style="margin: 0;"><strong>URL:</strong> <a href="${twitterUrl}">${twitterUrl}</a></p>
        </div>
        
        <h3>Detail Pemilih dan Alasan:</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr style="background-color: #f2f2f2;">
            <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Email</th>
            <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Alasan</th>
            <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Waktu</th>
          </tr>
          ${voters.map((voter, index) => `
            <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f9f9f9'};">
              <td style="padding: 8px; text-align: left; border: 1px solid #ddd;">${voter.email}</td>
              <td style="padding: 8px; text-align: left; border: 1px solid #ddd;">${voter.reason}</td>
              <td style="padding: 8px; text-align: left; border: 1px solid #ddd;">${formatDate(voter.createdAt)}</td>
            </tr>
          `).join('')}
        </table>
        
        <div style="margin: 25px 0; text-align: center;">
          <a href="${confirmationUrl}" style="background-color: #d32f2f; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Konfirmasi Penghapusan Tweet</a>
        </div>
        
        <p style="color: #666; font-size: 12px;">Catatan: Dengan mengklik tombol di atas, email konfirmasi akan dikirim ke semua voter bahwa tweet telah dihapus.</p>
        ${DEV_MODE ? '<p style="background-color: #ffeb3b; padding: 5px; color: #333;"><strong>DEV MODE ACTIVE</strong></p>' : ''}
      </div>
    `;

    await mailSender(adminEmail, emailSubject, emailHtml);
    console.log(`Admin notification email sent successfully to ${adminEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending admin notification:', error);
    return false;
  }
}

export async function POST(request) {
  try {
    console.log('DELVOTE POST: Starting connection to DB');
    await connectDB();
    console.log('DELVOTE POST: DB connected successfully');
    
    // Clean up old votes during each POST request
    await cleanupOldVotes();
    
    let data;
    try {
      data = await request.json();
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return NextResponse.json({ error: 'Invalid JSON format' }, { status: 400 });
    }
    
    const { email, twitterUrl, reason } = data;
    
    if (!email || !twitterUrl || !reason) {
      return NextResponse.json({ error: 'Email, Twitter URL, and reason are required' }, { status: 400 });
    }

    // Validate email
    if (!validateEmail(email)) {
      return NextResponse.json({ error: 'Email tidak valid! Pastikan anda menggunakan email ITB anda!' }, { status: 400 });
    }

    // Check if user exists and is verified
    const user = await User.findOne({ email, isVerified: true });
    if (!user && !DEV_MODE) { // Skip user verification in dev mode
      return NextResponse.json({ error: 'User not found or not verified' }, { status: 400 });
    }

    // Check if user has already voted for this tweet
    if (!DEV_MODE) { // Skip duplicate check in dev mode
      const existingVote = await DelVoteModel.findOne({ email, twitterUrl });
      if (existingVote) {
        return NextResponse.json({ error: 'Anda sudah melakukan vote untuk tweet ini' }, { status: 400 });
      }
    } else {
      console.log('DEV MODE: Allowing duplicate vote for testing');
    }

    // Create new vote
    const newVote = await DelVoteModel.create({
      email,
      twitterUrl,
      reason,
      createdAt: new Date()
    });

    if (DEV_MODE) {
      console.log('DEV MODE: Created vote with uniqueId:', newVote.uniqueId);
    }

    // Count votes
    const voteCount = await countVotesForTweet(twitterUrl);
    const VOTE_THRESHOLD = 10;
    const thresholdReached = voteCount >= VOTE_THRESHOLD;
    
    // If threshold reached, send notification to admin
    if (thresholdReached) {
      await sendAdminNotification(twitterUrl, voteCount);
    }

    if (DEV_MODE) {
      console.log(`DEV MODE: Current vote count for ${twitterUrl}: ${voteCount}/${VOTE_THRESHOLD}`);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Vote berhasil dicatat',
      currentVotes: voteCount,
      thresholdReached,
      devMode: DEV_MODE
    });
  } catch (error) {
    console.error('Error in vote submission:', error);
    return NextResponse.json({ 
      error: 'Failed to submit vote',
      details: error.message 
    }, { status: 500 });
  }
}

// Confirmation endpoint to send emails to voters
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const encodedUrl = searchParams.get('url');
  
  if (!token || !encodedUrl) {
    return NextResponse.json({ error: 'Token and URL are required' }, { status: 400 });
  }
  
  try {
    await connectDB();
    
    const twitterUrl = decodeURIComponent(encodedUrl);
    const expectedToken = Buffer.from(twitterUrl).toString('base64');
    
    // Verify token
    if (token !== expectedToken) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }
    
    // Get voters with their reasons
    const voters = await DelVoteModel.find({ twitterUrl }).select('email reason createdAt');
    if (!voters || voters.length === 0) {
      return NextResponse.json({ error: 'No votes found for this tweet' }, { status: 404 });
    }

    // Format date function
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleString('id-ID', { 
        dateStyle: 'medium', 
        timeStyle: 'short',
        hour12: false
      });
    };
    
    // Email subject
    const emailSubject = '✅ Konfirmasi Penghapusan Tweet | Draft Anak ITB';
    
    // In dev mode, potentially skip sending emails and just log them
    let successCount = 0;
    
    if (DEV_MODE && process.env.DEV_SKIP_EMAILS === 'true') {
      console.log('DEV MODE: Skipping sending emails to voters');
      console.log(`Would have sent to: ${voters.map(v => v.email).join(', ')}`);
      successCount = voters.length;
    } else {
      // Send personalized email to each voter individually
      for (const voter of voters) {
        try {
          // Create personalized email for each voter
          const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
              <h2 style="color: #4caf50;">Konfirmasi Penghapusan Tweet</h2>
              <p>Selamat! Tweet yang Anda laporkan telah dihapus:</p>
              
              <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <p style="margin: 0;"><strong>URL:</strong> <a href="${twitterUrl}">${twitterUrl}</a></p>
              </div>
              
              <div style="background: #e8f5e9; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <p style="margin: 0;"><strong>Alasan Anda:</strong> ${voter.reason}</p>
                <p style="margin: 5px 0 0; font-size: 12px; color: #666;">Dilaporkan pada: ${formatDate(voter.createdAt)}</p>
              </div>
              
              <p>Terima kasih atas partisipasi Anda dalam menjaga konten Draft Anak ITB agar tetap sesuai dengan ketentuan.</p>
              
              <p style="color: #666; margin-top: 30px;">Salam,<br>Tim Draft Anak ITB</p>
              ${DEV_MODE ? '<p style="background-color: #ffeb3b; padding: 5px; color: #333;"><strong>DEV MODE ACTIVE</strong></p>' : ''}
            </div>
          `;
          
          await mailSender(voter.email, emailSubject, emailHtml);
          successCount++;
          
          if (DEV_MODE) {
            console.log(`DEV MODE: Email sent to ${voter.email} with their reason: "${voter.reason.substring(0, 30)}..."`);
          }
        } catch (err) {
          console.error(`Failed to send email to ${voter.email}:`, err);
        }
      }
    }
    
    // Delete all votes for this tweet now that admin has confirmed deletion
    if (successCount > 0) {
      await DelVoteModel.deleteMany({ twitterUrl });
      console.log(`Deleted all votes for tweet: ${twitterUrl}`);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Confirmation emails sent successfully and votes have been removed',
      emailCount: successCount,
      totalVoters: voters.length,
      devMode: DEV_MODE
    });
  } catch (error) {
    console.error('Error in confirmation process:', error);
    return NextResponse.json({ 
      error: 'Failed to send confirmation emails',
      details: error.message 
    }, { status: 500 });
  }
} 
 
 
 