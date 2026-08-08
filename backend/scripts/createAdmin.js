const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Drop old index if needed (optional)
    try {
      const collection = mongoose.connection.collection('users');
      await collection.dropIndex('userName_1');
      console.log('✅ Dropped old userName index');
    } catch (err) {
      if (err.code === 27) console.log('ℹ️ Index userName_1 does not exist, skipping');
      else console.warn('⚠️ Could not drop index:', err.message);
    }

    const existing = await User.findOne({ email: 'admin@kn.com' });
    if (existing) {
      console.log('Admin already exists');
      process.exit(0);
    }

    // ✅ Pass plain password – the model's pre‑save hook will hash it
    const admin = new User({
      name: 'KN Admin',
      email: 'admin@kn.com',
      password: 'admin123',   // plain text, not hashed
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