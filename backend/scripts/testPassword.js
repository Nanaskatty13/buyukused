const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const testPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const user = await User.findOne({ email: 'admin@kn.com' });
    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }

    console.log('User found:', user.email);
    console.log('Stored hash:', user.password);
    console.log('Hash length:', user.password.length);

    // Test with the correct password
    const password = 'admin123';
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`✅ Password "${password}" matches?`, isMatch);

    // Test with a wrong password
    const wrong = 'wrongpassword';
    const isWrong = await bcrypt.compare(wrong, user.password);
    console.log(`❌ Wrong password matches?`, isWrong);

    // Test using the model method
    const modelMatch = await user.comparePassword(password);
    console.log(`✅ Model method matches?`, modelMatch);

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

testPassword();