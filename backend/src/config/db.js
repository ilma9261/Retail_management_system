import dns from 'dns';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Use reliable public DNS for resolving MongoDB Atlas SRV records
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // fallback to system resolver if restricted
}

// Load env from current directory first, then fallback to backend/.env
dotenv.config();
try {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });
} catch (e) {}

const mongoUri = process.env.MONGODB_URI;

mongoose.set('strictQuery', false);

let cachedConnection = null;

export const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }
  if (!mongoUri) {
    console.error('❌ MONGODB_URI not set');
    return null;
  }
  try {
    cachedConnection = await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB Atlas');
    return cachedConnection;
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    throw err;
  }
};

// Immediate connect for standalone mode
if (mongoUri) {
  connectDB().catch(() => {});
}

export default mongoose;
