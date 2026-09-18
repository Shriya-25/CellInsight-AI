import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './src/models/User.js';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cellinsight')
  .then(async () => {
    const passwordHash = await bcrypt.hash('test123', 10);
    const existing = await User.findOne({ email: 'test@gmail.com' });
    if (!existing) {
      await User.create({
        name: 'Test Pathologist',
        email: 'test@gmail.com',
        password: passwordHash,
        role: 'doctor/pathologist'
      });
      console.log('Test user created.');
    } else {
      existing.password = passwordHash;
      await existing.save();
      console.log('Test user updated.');
    }
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
