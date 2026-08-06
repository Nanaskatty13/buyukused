const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Drop the old 'userName' index if it exists
    try {
      const collection = mongoose.connection.collection('users');
      await collection.dropIndex('userName_1');
      console.log('✅ Dropped old userName index');
    } catch (err) {
      if (err.code === 27) {
        console.log('ℹ️ Index userName_1 does not exist, skipping');
      } else {
        console.warn('⚠️ Could not drop index:', err.message);
      }
    }

    const existing = await User.findOne({ email: 'admin@kn.com' });
    if (existing) {
      console.log('Admin already exists');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = new User({
      name: 'KN Admin',
      email: 'admin@kn.com',
      password: hashedPassword,
      phone: '0542928081',
      role: 'admin',
    });
    await admin.save();
    console.log('✅ Admin created: admin@kn.com / admin123');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
};

createAdmin();