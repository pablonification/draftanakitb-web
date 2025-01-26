import { connectToDatabase } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function GET(request) {
    try {
        const token = request.headers.get('Authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json({ success: false, error: 'No token provided' }, { status: 401 });
        }

        const verified = await verifyToken(token);
        if (!verified) {
            return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
        }

        const { db } = await connectToDatabase();
        const adminName = verified.name;

        // Get all admins and their tweet counts
        const adminTweetCounts = await db.collection('paidTweets')
            .aggregate([
                { $match: { tweetStatus: 'posted' } },
                { 
                    $group: {
                        _id: '$postedBy',
                        tweetCount: { $sum: 1 }
                    }
                }
            ]).toArray();

        // Calculate total tweets
        const totalTweetsPosted = adminTweetCounts.reduce((sum, admin) => sum + admin.tweetCount, 0);

        // Find current admin's tweet count
        const currentAdminStats = adminTweetCounts.find(admin => admin._id === adminName) || { tweetCount: 0 };
        const adminTweetsPosted = currentAdminStats.tweetCount;

        // Calculate profit share percentage
        const profitSharePercentage = totalTweetsPosted > 0 
            ? Math.round((adminTweetsPosted / totalTweetsPosted) * 100)
            : 0;

        // Get individual shares for all admins (for logging)
        const adminShares = adminTweetCounts.map(admin => ({
            adminName: admin._id,
            tweetsPosted: admin.tweetCount,
            sharePercentage: Math.round((admin.tweetCount / totalTweetsPosted) * 100)
        }));

        console.log('Admin shares:', adminShares);
        console.log(`Total tweets: ${totalTweetsPosted}`);
        console.log(`${adminName}'s tweets: ${adminTweetsPosted}`);
        console.log(`${adminName}'s share: ${profitSharePercentage}%`);

        // Update admin stats
        await db.collection('adminStats').updateOne(
            { adminName },
            { 
                $set: { 
                    tweetsPosted: adminTweetsPosted,
                    profitSharePercentage,
                    lastUpdated: new Date(),
                    totalTweetsInSystem: totalTweetsPosted,
                    adminShares // Store all admin shares for reference
                }
            },
            { upsert: true }
        );

        return NextResponse.json({
            success: true,
            stats: {
                adminName,
                tweetsPosted: adminTweetsPosted,
                profitSharePercentage,
                totalTweetsInSystem: totalTweetsPosted,
                adminShares,
                lastUpdated: new Date()
            }
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to fetch admin stats',
            details: error.message 
        }, { status: 500 });
    }
}
