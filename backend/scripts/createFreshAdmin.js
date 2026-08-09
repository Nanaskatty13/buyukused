const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI is not defined in .env');
  process.exit(1);
}

const createFreshAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const email = 'nanaskatty0@gmail.com';
    const password = 'Omega132';

    // Delete existing user with this email if any
    const existing = await User.findOne({ email });
    if (existing) {
      console.log(`⚠️ User ${email} exists – deleting...`);
      await existing.deleteOne();
      console.log(`✅ Deleted old user`);
    }

    // Create fresh admin
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = new User({
      name: 'Fresh Admin',
      email: email,
      password: hashed,
      phone: '0000000000',
      role: 'admin',
      isActive: true,
    });

    await user.save();
    console.log(`✅ Fresh admin created successfully!`);
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`👤 Role: admin`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

createFreshAdmin();