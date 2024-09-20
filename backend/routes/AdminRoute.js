const express = require('express');
const { isAuthenticated, isAdmin } = require('../middleware/authMiddleware');
const User = require('../models/User');

const router = express.Router();

router.get('/users', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/reset-password/:userId', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const newPassword = Math.random().toString(36).slice(-8);
        user.password = newPassword;
        await user.save();

      
        res.json({ message: 'Password reset successfully', newPassword });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;