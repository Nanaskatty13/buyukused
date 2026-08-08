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

const setPassword = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected');

    const email = 'nanaskatty@gmail.com';
    const plain = 'Admin123!';

    const user = await User.findOne({ email });
    if (!user) {
      console.error('User not found');
      process.exit(1);
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(plain, salt);
    await user.save();

    console.log(`✅ Password set to: ${plain}`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

setPassword();