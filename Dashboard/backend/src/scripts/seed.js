require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User.model');
const Analytics = require('../models/Analytics.model');

const seedUsers = async () => {
  const users = [
    {
      name: 'Super Admin',
      email: 'superadmin@example.com',
      password: 'password123',
      role: 'superadmin',
      isActive: true
    },
    {
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin',
      isActive: true
    },
    {
      name: 'Moderator User',
      email: 'moderator@example.com',
      password: 'password123',
      role: 'moderator',
      isActive: true
    },
    {
      name: 'Viewer User',
      email: 'viewer@example.com',
      password: 'password123',
      role: 'viewer',
      isActive: true
    }
  ];

  for (const userData of users) {
    const existingUser = await User.findOne({ email: userData.email });
    if (!existingUser) {
      await User.create(userData);
      console.log(`✅ Created user: ${userData.email}`);
    } else {
      console.log(`⏭️  User already exists: ${userData.email}`);
    }
  }
};

const seedAnalytics = async () => {
  const today = new Date();
  
  // Generate analytics for last 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const existing = await Analytics.findOne({
      date: { $gte: date, $lt: new Date(date.getTime() + 24 * 60 * 60 * 1000) }
    });

    if (!existing) {
      await Analytics.create({
        date,
        activeUsers: Math.floor(Math.random() * 500) + 100,
        newSignups: Math.floor(Math.random() * 50) + 5,
        pageViews: Math.floor(Math.random() * 10000) + 1000,
        revenue: Math.floor(Math.random() * 50000) + 5000,
        transactions: Math.floor(Math.random() * 200) + 20,
        traffic: {
          organic: Math.floor(Math.random() * 1000) + 200,
          direct: Math.floor(Math.random() * 800) + 150,
          referral: Math.floor(Math.random() * 500) + 100,
          social: Math.floor(Math.random() * 600) + 120,
          paid: Math.floor(Math.random() * 400) + 80
        }
      });
      console.log(`✅ Created analytics for ${date.toISOString().split('T')[0]}`);
    }
  }
};

const seed = async () => {
  try {
    // Supports both local MongoDB and MongoDB Atlas connection strings
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/admin-dashboard', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('🌱 Starting seed...');
    
    await seedUsers();
    await seedAnalytics();
    
    console.log('✅ Seed completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seed();

