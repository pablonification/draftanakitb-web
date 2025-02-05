import { MongoClient } from 'mongodb';
import { initializeCronJobs } from '../utils/cronJobs';

// Use MongoDB Atlas connection string in production, fallback to local in development
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

// Development environment check
if (process.env.NODE_ENV === 'development') {
    console.log('Running in development mode');
    if (!MONGODB_URI) {
        console.warn('MongoDB URI not found in development. Please set MONGODB_URI in .env.local');
    }
}

if (!MONGODB_URI) {
    throw new Error(
        'Please define the MONGODB_URI environment variable inside .env.local'
    );
}

if (!MONGODB_DB) {
    throw new Error(
        'Please define the MONGODB_DB environment variable inside .env.local'
    );
}

let cachedClient = null;
let cachedDb = null;

export async function connectToDatabase() {
    if (cachedClient && cachedDb) {
        return { client: cachedClient, db: cachedDb };
    }

    try {
        // Parse connection string to check if it has credentials
        const url = new URL(MONGODB_URI);
        if (!url.username || !url.password) {
            console.warn('MongoDB connection string might be missing credentials');
        }

        // Connect with new MongoClient with optimized options
        const client = await MongoClient.connect(MONGODB_URI, {
            maxPoolSize: 10,
            minPoolSize: 5,
            connectTimeoutMS: 30000, // Increased timeout
            socketTimeoutMS: 45000,
            serverSelectionTimeoutMS: 30000, // Increased timeout
            ssl: true, // Always use SSL for security
            tls: true, // Enable TLS
            retryWrites: true,
            retryReads: true,
            w: 'majority',
            maxIdleTimeMS: 120000, // 2 minutes idle time
            heartbeatFrequencyMS: 10000,
            directConnection: false, // Disable direct connection
            authSource: 'admin' // Specify auth source
        });

        const db = client.db(MONGODB_DB);

        // Test the connection with a simple command
        await db.command({ ping: 1 });

        // Cache the client and db connections
        cachedClient = client;
        cachedDb = db;

        console.log('Successfully connected to MongoDB');

        // Initialize cron jobs after successful connection
        initializeCronJobs();

        return { client, db };
    } catch (error) {
        console.error('MongoDB connection error:', error);
        if (error.name === 'MongoServerSelectionError') {
            console.error('Could not connect to MongoDB server. Please check:');
            console.error('1. MongoDB connection string is correct and includes username:password');
            console.error('2. MongoDB server is running and accessible');
            console.error('3. Network connectivity and firewall settings (port 27017 must be open)');
            console.error('4. Database user has correct permissions');
            console.error('5. IP address is whitelisted in MongoDB Atlas');
            
            // Log the sanitized connection string (without credentials)
            try {
                const sanitizedUri = MONGODB_URI.replace(
                    /mongodb(\+srv)?:\/\/([^:]+):([^@]+)@/,
                    'mongodb$1://*****:*****@'
                );
                console.error('Connection string format:', sanitizedUri);
            } catch (e) {
                console.error('Invalid connection string format');
            }
        }
        // Clear cache on error to allow retry
        cachedClient = null;
        cachedDb = null;
        throw error;
    }
}

// Add connection retry logic with better error handling
export async function connectWithRetry(maxRetries = 3) {
    let lastError = null;
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await connectToDatabase();
        } catch (error) {
            lastError = error;
            if (i === maxRetries - 1) {
                console.error(`Failed to connect after ${maxRetries} attempts`);
                throw error;
            }
            const delay = Math.min(1000 * Math.pow(2, i), 10000); // Exponential backoff with 10s max
            console.log(`Retrying connection attempt ${i + 1}/${maxRetries} in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    throw lastError;
}
