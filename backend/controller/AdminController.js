const User = require("../models/User");
const bcrypt = require('bcrypt');
const speakeasy = require('speakeasy');

const getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const toggleUserAccess = async (req, res) => {
    try {
        const { password, authCode } = req.body;
        const masterAdmin = await User.findById(req.user.userId);

        if (!await bcrypt.compare(password, masterAdmin.password)) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        if (masterAdmin.twoFactorEnabled) {
            const verified = speakeasy.totp.verify({
                secret: masterAdmin.twoFactorSecret,
                encoding: 'base32',
                token: authCode
            });
            if (!verified) {
                return res.status(401).json({ error: 'Invalid 2FA code' });
            }
        }

        const userToToggle = await User.findById(req.params.userId);
        if (!userToToggle) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (userToToggle.role === 'master_admin') {
            return res.status(403).json({ error: 'Cannot toggle access for master admin' });
        }

        userToToggle.isActive = !userToToggle.isActive;
        await userToToggle.save();

        res.json({ message: 'User access updated successfully', isActive: userToToggle.isActive });
    } catch (error) {
        console.error('Error toggling user access:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const getAdmins = async (req, res) => {
    try {
        const admins = await User.find({ role: 'admin' }).select('-password');
        res.json(admins);
    } catch (error) {
        console.error('Error fetching admins:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const promoteToAdmin = async (req, res) => {
    try {
        const { password, authCode } = req.body;
        const masterAdmin = await User.findById(req.user.userId);

        if (!await bcrypt.compare(password, masterAdmin.password)) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        if (masterAdmin.twoFactorEnabled) {
            const verified = speakeasy.totp.verify({
                secret: masterAdmin.twoFactorSecret,
                encoding: 'base32',
                token: authCode
            });
            if (!verified) {
                return res.status(401).json({ error: 'Invalid 2FA code' });
            }
        }

        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.role = 'admin';
        await user.save();

        res.json({ message: 'User promoted to admin successfully', user });
    } catch (error) {
        console.error('Error promoting user to admin:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const demoteAdmin = async (req, res) => {
    try {
        const { password, authCode } = req.body;
        const masterAdmin = await User.findById(req.user.userId);

        if (!await bcrypt.compare(password, masterAdmin.password)) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        if (masterAdmin.twoFactorEnabled) {
            const verified = speakeasy.totp.verify({
                secret: masterAdmin.twoFactorSecret,
                encoding: 'base32',
                token: authCode
            });
            if (!verified) {
                return res.status(401).json({ error: 'Invalid 2FA code' });
            }
        }

        const admin = await User.findById(req.params.userId);
        if (!admin || admin.role !== 'admin') {
            return res.status(404).json({ error: 'Admin not found' });
        }

        admin.role = 'user';
        await admin.save();

        res.json({ message: 'Admin demoted to user successfully', user: admin });
    } catch (error) {
        console.error('Error demoting admin:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const toggle2FA = async (req, res) => {
    try {
        const { password, authCode } = req.body;
        const admin = await User.findById(req.user.userId);

        if (!await bcrypt.compare(password, admin.password)) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        if (admin.twoFactorEnabled) {
            const verified = speakeasy.totp.verify({
                secret: admin.twoFactorSecret,
                encoding: 'base32',
                token: authCode
            });
            if (!verified) {
                return res.status(401).json({ error: 'Invalid 2FA code' });
            }
        }

        const userToToggle = await User.findById(req.params.userId);
        if (!userToToggle) {
            return res.status(404).json({ error: 'User not found' });
        }

        userToToggle.twoFactorEnabled = !userToToggle.twoFactorEnabled;
        if (!userToToggle.twoFactorEnabled) {
            userToToggle.twoFactorSecret = undefined;
        }
        await userToToggle.save();

        res.json({ message: '2FA status updated successfully', twoFactorEnabled: userToToggle.twoFactorEnabled });
    } catch (error) {
        console.error('Error toggling 2FA:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = { getUsers, toggleUserAccess, getAdmins, promoteToAdmin, demoteAdmin, toggle2FA };