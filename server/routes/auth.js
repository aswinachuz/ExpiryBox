const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Person = require('../models/Person');

const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production'
  ? (() => {
      console.warn('⚠️ WARNING: JWT_SECRET environment variable is not explicitly set. Using fallback secret.');
      return 'expirybox_production_jwt_fallback_secret_key_2026';
    })()
  : 'expirybox_dev_jwt_secret_key_2026');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// 1. REGISTER ACCOUNT (Email + Password + Mobile)
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone ? phone.trim() : '',
      password: hashedPassword,
      avatar: '👤',
      isGoogleUser: false,
    });

    await newUser.save();

    // Ensure a matching primary Person profile exists for household tracking
    let person = await Person.findOne({ name: newUser.name });
    if (!person) {
      person = new Person({
        name: newUser.name,
        relation: 'Self',
        avatar: '👦',
        isPrimary: true,
        email: newUser.email,
        phone: newUser.phone,
      });
      await person.save();
    } else {
      if (newUser.phone) person.phone = newUser.phone;
      if (newUser.email) person.email = newUser.email;
      await person.save();
    }

    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        avatar: newUser.avatar,
        isGoogleUser: newUser.isGoogleUser,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. LOGIN (Email + Password)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.password && user.isGoogleUser) {
      return res.status(400).json({
        success: false,
        message: 'This account was created with Google. Please use "Continue with Google".',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Signed in successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        isGoogleUser: user.isGoogleUser,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. GOOGLE / GMAIL CONNECTION & LOGIN
router.post('/google', async (req, res) => {
  try {
    const { email, name, avatar, googleId, phone } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Google account email is required' });
    }

    let user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      // Create new user connected with Google
      user = new User({
        name: name || email.split('@')[0],
        email: email.toLowerCase().trim(),
        phone: phone || '',
        avatar: avatar || '🌐',
        googleId: googleId || `google_${Date.now()}`,
        isGoogleUser: true,
      });
      await user.save();
    } else {
      // Connect existing account with Google
      user.isGoogleUser = true;
      if (googleId) user.googleId = googleId;
      if (avatar && !user.avatar) user.avatar = avatar;
      if (phone && !user.phone) user.phone = phone;
      await user.save();
    }

    // Ensure matching Person profile exists
    let person = await Person.findOne({ email: user.email });
    if (!person) {
      person = new Person({
        name: user.name,
        relation: 'Self',
        avatar: user.avatar || '👦',
        isPrimary: true,
        email: user.email,
        phone: user.phone,
      });
      await person.save();
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Connected with Gmail / Google successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        isGoogleUser: true,
      },
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. GET CURRENT USER PROFILE
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired session' });
  }
});

// 5. UPDATE USER PROFILE (Mobile, Name)
router.put('/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const { name, phone } = req.body;
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();

    await user.save();

    // Also sync with primary person
    await Person.findOneAndUpdate(
      { isPrimary: true },
      { name: user.name, phone: user.phone },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        isGoogleUser: user.isGoogleUser,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
