import dns from 'dns';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Only set custom DNS on local machines where local router blocks SRV (never in cloud serverless like Vercel)
if (!process.env.VERCEL && process.platform === 'win32') {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (e) {}
}

dotenv.config();
try {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });
} catch (e) {}

const mongoUri = process.env.MONGODB_URI;

mongoose.set('strictQuery', false);

let cachedPromise = null;

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  if (!mongoUri) {
    console.error('❌ MONGODB_URI is not defined in environment variables');
    throw new Error('MONGODB_URI is not defined in environment variables');
  }
  if (!cachedPromise) {
    cachedPromise = mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 8000,
    }).then(conn => {
      console.log('✅ Connected to MongoDB Atlas');
      return conn;
    }).catch(err => {
      cachedPromise = null;
      console.error('❌ MongoDB connection error:', err);
      throw err;
    });
  }
  return cachedPromise;
};

// Immediate connect for standalone server
if (mongoUri && !process.env.VERCEL) {
  connectDB().catch(() => {});
}

export default mongoose;
