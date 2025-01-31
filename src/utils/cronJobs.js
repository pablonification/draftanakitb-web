import cron from 'node-cron';
import { DailyMessageCount } from '../app/models/dailyMessageCount';
import { PaidTweet } from '../app/models/paidTweetModel';

export function initializeCronJobs() {
    // Reset counter at 10:00 every day
    cron.schedule('0 10 * * *', async () => {
        try {
            const today = new Date();
            today.setHours(0, 10, 0, 0);
            
            await DailyMessageCount.findOneAndUpdate(
                { date: today },
                { $set: { regularCount: 0 } },
                { upsert: true }
            );
            
            console.log('Daily message count reset successfully');
        } catch (error) {
            console.error('Error resetting daily message count:', error);
        }
    }, {
        scheduled: true,
        timezone: "Asia/Jakarta"
    });

    // Cleanup media for posted tweets every hour
    cron.schedule('0 * * * *', async () => {
        try {
            console.log('Starting hourly media cleanup...');
            
            // Find all posted tweets with media that haven't been cleaned up
            const postedTweetsWithMedia = await PaidTweet.find({
                tweetStatus: 'posted',
                mediaUrl: { $exists: true, $ne: null },
                mediaDeleted: { $ne: true }
            });

            console.log(`Found ${postedTweetsWithMedia.length} tweets to clean up`);

            for (const tweet of postedTweetsWithMedia) {
                try {
                    // Mark the media as deleted
                    await PaidTweet.findByIdAndUpdate(tweet._id, {
                        mediaDeleted: true,
                        mediaUrl: null // Remove the media URL
                    });
                    console.log(`Cleaned up media for tweet ${tweet._id}`);
                } catch (err) {
                    console.error(`Error cleaning up tweet ${tweet._id}:`, err);
                }
            }

            console.log('Media cleanup completed');
        } catch (error) {
            console.error('Error during media cleanup:', error);
        }
    }, {
        scheduled: true,
        timezone: "Asia/Jakarta"
    });
}
