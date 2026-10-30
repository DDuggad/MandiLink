import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn(
      '⚠️  MONGODB_URI not set. Running in offline/mock mode (database features will fallback to in-memory seed).'
    );
    return null;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error(`❌ MongoDB connection error: ${err.message}`);
    console.warn(
      '⚠️  Server continuing with degraded database connectivity. In-memory data will be served where available.'
    );
    return null;
  }
}
