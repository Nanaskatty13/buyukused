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

const checkPassword = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const adminEmail = 'nanaskatty0@gmail.com';

    const user = await User.findOne({ email: adminEmail });
    if (!user) {
      console.log(`❌ User ${adminEmail} not found`);
      process.exit(1);
    }

    console.log('👤 User found:', user.email);
    console.log('🔐 Stored password hash:', user.password);

    // Test if 'Admin123!' matches the stored hash
    const testPassword = 'Omega132!';
    const isMatch = await bcrypt.compare(testPassword, user.password);
    console.log(`❓ Does '${testPassword}' match?`, isMatch);

    // Also hash the test password to compare visually
    const salt = await bcrypt.genSalt(10);
    const hashedTest = await bcrypt.hash(testPassword, salt);
    console.log(`🧪 Fresh hash of '${testPassword}':`, hashedTest);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

checkPassword();