import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from './models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const seedAdmin = async () => {
  try {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
    const dbName = process.env.MONGO_DB_NAME || 'RichGirl_Test';
    await mongoose.connect(uri, { dbName });
    console.log(`✅ Connected to MongoDB Atlas. Database: ${dbName}`);

    const adminEmail = 'admin@richgirl.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('⚠️ Admin user already exists. Email:', adminEmail);
      process.exit(0);
    }

    // Hash password
    const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'AdminPass123!';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    const newAdmin = new User({
      name: 'Super Admin',
      email: adminEmail,
      password: hashedPassword,
      phone: '9999999999',
      isAdmin: true,
      isVerified: true
    });

    await newAdmin.save();
    console.log('🎉 Admin user successfully created!');
    console.log('-----------------------------------');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    console.log('-----------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
};

seedAdmin();
