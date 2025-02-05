import { connectWithRetry } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

// Improved cache with separate keys for different pages
const tweetsCache = new Map();
const CACHE_TTL = 30000; // 30 seconds
const TWEETS_PER_PAGE = 20;

// Helper to generate cache key
const getCacheKey = (page, limit, search = '', searchType = '') => 
    `regular_tweets_${page}_${limit}_${search}_${searchType}`;

// Helper to check if cache is valid
const isCacheValid = (cacheEntry) => {
    return cacheEntry && 
           cacheEntry.timestamp && 
           (Date.now() - cacheEntry.timestamp < CACHE_TTL);
};

export async function GET(request) {
    try {
        // Verify authentication
        const token = request.headers.get('Authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json({ success: false, error: 'No token provided' }, { status: 401 });
        }

        const verified = await verifyToken(token);
        if (!verified) {
            return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
        }

        // Parse pagination and search parameters from URL
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page')) || 1;
        const limit = parseInt(url.searchParams.get('limit')) || TWEETS_PER_PAGE;
        const searchQuery = url.searchParams.get('search') || '';
        const searchType = url.searchParams.get('searchType') || 'message';
        const skip = (page - 1) * limit;

        console.log('Fetching regular tweets with params:', { page, limit, skip, searchQuery, searchType });

        // Generate cache key including search parameters
        const cacheKey = getCacheKey(page, limit, searchQuery, searchType);
        const cacheEntry = tweetsCache.get(cacheKey);

        // Check cache
        if (isCacheValid(cacheEntry)) {
            console.log(`Returning cached regular tweets for page ${page}`);
            return NextResponse.json(cacheEntry.data);
        }

        // Connect to database using retry logic
        const { db } = await connectWithRetry();

        const COLLECTION_NAME = 'regulartweets';

        // Build search query
        const searchFilter = {};
        if (searchQuery) {
            if (searchType === 'email') {
                searchFilter.email = { $regex: searchQuery, $options: 'i' };
            } else {
                searchFilter.messageText = { $regex: searchQuery, $options: 'i' };
            }
        }

        // Get total count with search filter
        const totalResult = await db.collection(COLLECTION_NAME)
            .aggregate([
                { $match: searchFilter },
                { $count: 'total' }
            ])
            .toArray();
            
        const total = totalResult.length > 0 ? totalResult[0].total : 0;
        const totalPages = Math.max(Math.ceil(total / limit), 1);

        console.log('Total regular tweets found:', total, 'with filter:', searchFilter);

        // Fetch tweets with pagination and search
        const tweets = await db.collection(COLLECTION_NAME)
            .find(searchFilter)
            .project({
                _id: 1,
                email: 1,
                messageText: 1,
                mediaUrl: 1,
                tweetId: 1,
                tweetStatus: 1,
                createdAt: 1,
                notificationSent: 1
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .toArray();

        console.log(`Found ${tweets.length} regular tweets for page ${page}`);

        const response = {
            success: true,
            tweets: tweets.map(tweet => ({
                ...tweet,
                tweetStatus: tweet.tweetStatus || 'pending'
            })),
            totalPages,
            currentPage: page,
            total
        };

        // Update cache
        tweetsCache.set(cacheKey, {
            data: response,
            timestamp: Date.now()
        });

        // Clean up old cache entries
        const now = Date.now();
        for (const [key, value] of tweetsCache.entries()) {
            if (now - value.timestamp > CACHE_TTL) {
                tweetsCache.delete(key);
            }
        }

        return NextResponse.json(response, {
            headers: {
                'Cache-Control': 'private, no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
    } catch (error) {
        console.error('Error in regular tweets route:', error);
        console.error('Error details:', error.stack);
        
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch regular tweets',
            details: error.message
        }, { 
            status: 500,
            headers: {
                'Cache-Control': 'no-store'
            }
        });
    }
}
