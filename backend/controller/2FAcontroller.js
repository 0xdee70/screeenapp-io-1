const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.setupTwoFactor = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const secret = speakeasy.generateSecret({ name: 'ScreenAppPro' });
        user.twoFactorSecret = secret.base32;
        await user.save();

        const otpauthUrl = speakeasy.otpauthURL({
            secret: secret.ascii,
            label: user.email,
            issuer: 'ScreenAppPro'
        });

        const qrCodeDataUrl = await qrcode.toDataURL(otpauthUrl);

        res.json({ secret: secret.base32, qrCode: qrCodeDataUrl });
    } catch (error) {
        console.error('Setup 2FA error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.verifyAndEnableTwoFactor = async (req, res) => {
    try {
        const { token } = req.body;
        const user = await User.findById(req.user.userId);

        if (!user || !user.twoFactorSecret) {
            return res.status(400).json({ message: 'Two-factor authentication not set up' });
        }

        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token
        });

        if (verified) {
            user.twoFactorEnabled = true;
            await user.save();
            res.json({ message: 'Two-factor authentication enabled successfully' });
        } else {
            res.status(400).json({ message: 'Invalid token' });
        }
    } catch (error) {
        console.error('Verify and enable 2FA error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.verifyTwoFactor = async (req, res) => {
    try {
        const { email, token } = req.body;
        const user = await User.findOne({ email, role: 'master_admin' });

        if (!user || !user.twoFactorSecret || !user.twoFactorEnabled) {
            return res.status(400).json({ message: 'Two-factor authentication not enabled' });
        }

        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token
        });

        if (verified) {
            const jwtToken = jwt.sign(
                { userId: user._id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );
            res.json({ token: jwtToken, role: user.role });
        } else {
            res.status(400).json({ message: 'Invalid token' });
        }
    } catch (error) {
        console.error('Verify 2FA error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
