import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { connectDB } from '../config/db.js';

const seedUsers = async () => {
  await connectDB();

  console.log('Clearing existing users...');
  await User.deleteMany({});

  const passwordHash = await bcrypt.hash('password123', 10);

  const demoUsers = [
    {
      name: 'Demo Technician',
      email: 'tech@cellinsight.com',
      password: passwordHash,
      role: 'technician',
    },
    {
      name: 'Demo Pathologist',
      email: 'doctor@cellinsight.com',
      password: passwordHash,
      role: 'doctor/pathologist',
    },
    {
      name: 'Demo Admin',
      email: 'admin@cellinsight.com',
      password: passwordHash,
      role: 'administrator',
    },
  ];

  console.log('Inserting demo users (DEVELOPMENT ONLY)...');
  await User.insertMany(demoUsers);
  
  console.log('Seed completed successfully!');
  process.exit(0);
};

seedUsers().catch(error => {
  console.error('Seed failed:', error);
  process.exit(1);
});
