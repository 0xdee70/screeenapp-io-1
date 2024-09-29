const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const authenticate = require('../middleware/authMiddleware');
const router = express.Router();
const dotenv = require('dotenv');
const passport = require('passport')
dotenv.config();
const { setupTwoFactor, verifyAndEnableTwoFactor, verifyTwoFactor } = require('../controller/2FAcontroller');

const generateToken = (user) => {
    return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '6h' });
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

router.post('/master-login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email, role: 'master_admin' });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials or not authorized' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (user.twoFactorEnabled) {
            return res.json({ requireTwoFactor: true, email: user.email });
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token, role: user.role });
    } catch (error) {
        console.error('Master login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/admin-login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email, role: 'admin' });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials or not authorized' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (user.twoFactorEnabled) {
            return res.json({ requireTwoFactor: true, email: user.email });
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token, role: user.role });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/setup-2fa', authenticate('master_admin'), setupTwoFactor);
router.post('/enable-2fa', authenticate('master_admin'), verifyAndEnableTwoFactor);
router.post('/verify-2fa', verifyTwoFactor);

router.get('/protected', (req, res) => {
    const token = req.header('Authorization').replace('Bearer ', ' ');

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
    passport.authenticate(strategy, { failureRedirect: `/api/auth/${strategy}/failure` })(req, res, () => {
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
