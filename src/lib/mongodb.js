import { MongoClient } from 'mongodb';
import Grid from 'gridfs-stream';

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
let gfs = null;

export async function connectToDatabase() {
    if (cachedClient && cachedDb) {
        return { client: cachedClient, db: cachedDb, gfs };
    }

    try {
        const client = await MongoClient.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        const db = client.db(MONGODB_DB);
        gfs = Grid(db, MongoClient);
        gfs.collection('uploads'); // Set collection name to 'uploads'

        cachedClient = client;
        cachedDb = db;

        return { client, db, gfs };
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
}
