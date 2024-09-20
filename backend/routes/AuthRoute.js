const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const authenticate = require('../middleware/authMiddleware');
const router = express.Router();
const dotenv = require('dotenv');
const passport = require('passport')
dotenv.config();

const generateToken = (user) => {
    return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

router.post('/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });
        const role = email.endsWith('@duck.com') ? 'admin' : 'user';
        user = new User({ email, password, role });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' })
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = generateToken(user);
        res.json({ token, role: user.role });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/protected', (req, res) => {
    const token = req.header('Authorization').replace('Bearer ', '');

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.json({ message: 'Access granted', role: decoded.role });
    } catch (err) {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
});


router.get('/user', authenticate('user'), (req, res) => {
    res.json({ message: 'User access granted', user: req.user });
});


router.get('/admin', authenticate('admin'), (req, res) => {
    res.json({ message: 'Admin access granted', user: req.user });
});

const handleSSOCallback = (strategy) => (req, res) => {
    passport.authenticate(strategy, { failureRedirect: `/auth/${strategy}/failure` })(req, res, () => {
      const token = generateToken(req.user);
      const role = req.user.role;
      res.redirect(`${process.env.FRONTEND_URL}/login?token=${token}&role=${role}`);
    });
  };
   
  const handleSSOFailure = (strategy) => (req, res) => {
    const errorMessage = encodeURIComponent(`${strategy} authentication failed. Please try again.`);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=${errorMessage}`);
  };
  
  ['github', 'google', 'microsoft'].forEach(strategy => {
    router.get(`/${strategy}`, passport.authenticate(strategy, { scope: ['user:email'] }));
    router.get(`/${strategy}/callback`, handleSSOCallback(strategy));
    router.get(`/${strategy}/failure`, handleSSOFailure(strategy));
  });

module.exports = router;
