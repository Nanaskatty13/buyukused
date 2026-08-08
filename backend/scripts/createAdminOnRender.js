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

const createAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const email = 'nanaskatty0@gmail.com';
    const password = 'Omega132';

    const existing = await User.findOne({ email });
    if (existing) {
      existing.role = 'admin';
      const salt = await bcrypt.genSalt(10);
      existing.password = await bcrypt.hash(password, salt);
      await existing.save();
      console.log(`✅ ${email} updated to admin with new password`);
    } else {
      const salt = await bcrypt.genSalt(10);
      const user = new User({
        name: 'Admin',
        email,
        password: await bcrypt.hash(password, salt),
        phone: '0000000000',
        role: 'admin',
        isActive: true,
      });
      await user.save();
      console.log(`✅ Admin created: ${email} / ${password}`);
    }
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
};

createAdmin();