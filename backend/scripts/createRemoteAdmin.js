const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

// Load the User model
const User = require('../models/User');

// Use the same MONGO_URI from your .env (points to Render)
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI is not defined in .env');
  process.exit(1);
}

const createAdmin = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Your admin credentials – change these as needed
    const adminEmail = process.env.ADMIN_EMAIL || 'nanaskatty0@gmail.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Omega132';

    // Check if user exists
    let user = await User.findOne({ email: adminEmail });

    if (user) {
      // If exists, promote to admin if not already
      if (user.role !== 'admin') {
        user.role = 'admin';
        await user.save();
        console.log(`✅ User ${adminEmail} promoted to admin`);
      } else {
        console.log(`ℹ️ User ${adminEmail} is already admin`);
      }
    } else {
      // Create new admin
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      user = new User({
        name: 'Admin',
        email: adminEmail,
        password: hashedPassword,
        phone: '0000000000',
        role: 'admin',
        isActive: true,
      });
      await user.save();
      console.log(`✅ Admin created successfully:`);
      console.log(`   📧 Email: ${adminEmail}`);
      console.log(`   🔑 Password: ${adminPassword}`);
    }

    // Show the user (without password) for verification
    const userObj = user.toObject();
    delete userObj.password;
    console.log('👤 User data:', userObj);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

createAdmin();