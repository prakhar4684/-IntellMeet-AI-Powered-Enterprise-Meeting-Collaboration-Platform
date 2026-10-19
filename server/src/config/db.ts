import mongoose from 'mongoose';
import { env } from './env';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[Database] Warning: Local MongoDB connection failed (${(error as Error).message}).`);
    console.warn(`[Database] IntellMeet will continue operating. Note: Database persistence requires MongoDB.`);
  }
};
