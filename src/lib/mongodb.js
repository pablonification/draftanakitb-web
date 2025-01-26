import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB = process.env.MONGODB_DB || 'draftanakitb';

// Development environment check
if (process.env.NODE_ENV === 'development') {
    console.log('Running in development mode');
    console.log('MongoDB URI:', MONGODB_URI);
    console.log('MongoDB DB:', MONGODB_DB);
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
        // Connect with new MongoClient
        const client = await MongoClient.connect(MONGODB_URI, {
            maxPoolSize: 10,
            minPoolSize: 5,
        });

        const db = client.db(MONGODB_DB);

        // Cache the client and db connections
        cachedClient = client;
        cachedDb = db;

        return { client, db };
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
}
