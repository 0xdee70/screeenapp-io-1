const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authenticate = require('../middleware/authMiddlewareMongo');

// Get user profile
router.get('/profile', authenticate(), async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error in get profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update user profile
router.put('/profile', authenticate(), async (req, res) => {
    try {
        const { name, email, username } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (name) user.name = name;
        if (email) user.email = email;
        if (username) user.username = username;

        await user.save();

        res.json({ message: 'Profile updated successfully', user });
    } catch (error) {
        console.error('Error in update profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

