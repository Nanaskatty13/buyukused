const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const updateRole = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const result = await User.updateOne(
    { email: "nanaskatty13@gmail.com" },
    { role: "seller" }
  );
  console.log('Updated:', result);
  process.exit(0);
};
updateRole();