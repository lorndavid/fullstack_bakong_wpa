import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Product from './models/Product';
import connectDB from './config/database';

async function clearProducts() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('Connected successfully.\n');

    const result = await Product.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} products`);
    console.log('Categories, users, and orders are preserved.');
    console.log('\nAdmin can now create products with real images via the admin panel.');
    console.log('Admin login: http://localhost:5174 (lorndavid@gmail.com / 150505)');
  } catch (error) {
    console.error('Failed to clear products:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  }
}

clearProducts();
