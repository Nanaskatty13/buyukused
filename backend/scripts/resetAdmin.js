// scripts/resetAdmin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const resetAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const email = 'nanaskatty0@gmail.com';
    const password = 'Omega132';
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await User.updateOne(
      { email },
      {
        $set: {
          password: hashedPassword,
          name: 'KN Admin',
          phone: '0542928081',
          role: 'admin'
        }
      },
      { upsert: true }
    );

    console.log('✅ Admin password reset:', email, password);
    console.log('New hash:', hashedPassword);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

resetAdmin();