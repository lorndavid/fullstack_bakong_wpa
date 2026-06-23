import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from './models/User';
import connectDB from './config/database';

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('Connected successfully.');

    const adminEmail = 'lorndavid@gmail.com';
    const adminPassword = '150505';
    const adminName = 'Lorn David';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      // Update existing admin's password and role
      existingAdmin.password = adminPassword;
      existingAdmin.role = 'admin';
      existingAdmin.name = adminName;
      existingAdmin.provider = 'local';
      await existingAdmin.save();
      console.log(`✅ Admin user updated: ${adminEmail} (role: admin)`);
    } else {
      // Create new admin
      await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        provider: 'local',
      });
      console.log(`✅ Admin user created: ${adminEmail} (role: admin)`);
    }

    console.log('\nAdmin credentials:');
    console.log('  Email:    ' + adminEmail);
    console.log('  Password: ' + adminPassword);
    console.log('  Role:     admin');
    console.log('\nYou can now login at:');
    console.log('  Admin panel: http://localhost:5174');
    console.log('  User app:    http://localhost:5173');
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  }
}

seed();
