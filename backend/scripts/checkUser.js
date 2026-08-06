const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const checkUser = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOne({ email: 'admin@kn.com' });
  if (user) {
    console.log('User found:');
    console.log('Name:', user.name);
    console.log('Email:', user.email);
    console.log('Password hash:', user.password);
    console.log('Role:', user.role);
    console.log('Password length:', user.password ? user.password.length : 'null');
  } else {
    console.log('User not found');
  }
  process.exit();
};

checkUser();