const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ============================================================
//  REGISTER
// ============================================================
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      console.log(`⚠️ Registration attempt with existing email: ${normalizedEmail}`);
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone || '',
      role: role || 'seller',
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('❌ Register error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================
//  LOGIN
// ============================================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      console.log(`❌ Login failed: user not found (${normalizedEmail})`);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`❌ Login failed: wrong password for ${normalizedEmail}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================
//  GET CURRENT USER (protected)
// ============================================================
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (err) {
    console.error('❌ /me error:', err);
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

// ============================================================
//  LOGOUT (optional – just discard token on frontend)
// ============================================================
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out' });
});

// ============================================================
//  CREATE ADMIN (temporary – remove after first use)
// ============================================================
router.post('/create-admin', async (req, res) => {
  try {
    const { secret, email, password, name = 'Admin' } = req.body;

    const ADMIN_SECRET = process.env.ADMIN_SECRET || 'MySuperSecret123!';

    if (secret !== ADMIN_SECRET) {
      return res.status(403).json({ success: false, message: 'Invalid secret' });
    }

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    let user = await User.findOne({ email: email.toLowerCase().trim() });
    if (user) {
      if (user.role !== 'admin') {
        user.role = 'admin';
        await user.save();
        return res.json({ success: true, message: 'User promoted to admin', user: { id: user._id, email: user.email, role: user.role } });
      }
      return res.json({ success: true, message: 'User is already admin' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user = new User({
      name,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: '0000000000',
      role: 'admin',
      isActive: true,
    });
    await user.save();

    res.json({ success: true, message: 'Admin created successfully', user: { id: user._id, email: user.email, role: user.role } });
  } catch (err) {
    console.error('❌ Create admin error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;