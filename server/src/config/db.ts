import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { seedDatabase } from '../utils/seedData';

dotenv.config();

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI as string);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Заполняем базу данных начальными данными
    await seedDatabase();
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
};

export default connectDB;