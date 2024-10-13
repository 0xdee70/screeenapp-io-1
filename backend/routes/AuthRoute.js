const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const authenticate = require('../middleware/authMiddleware');
const router = express.Router();
const dotenv = require('dotenv');
const passport = require('passport');
const { v4: uuidv4 } = require('uuid');
dotenv.config();
const { setupTwoFactor, verifyAndEnableTwoFactor, verifyTwoFactor } = require('../controller/2FAcontroller');

// Configure AWS
const client = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const dynamoDB = DynamoDBDocumentClient.from(client);

const generateToken = (user) => {
    if (!user) {
        throw new Error('User object is undefined');
    }
    return jwt.sign({
        id: 'USER',  // Use 'USER' as the id
        userId: user.userId || user.id, // Use userId if available, otherwise fall back to id
        role: user.role || 'user' // Default to 'user' if role is not present
    }, process.env.JWT_SECRET, { expiresIn: '6h' });
};

router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if user already exists using Scan
        const scanParams = {
            TableName: process.env.DYNAMODB_USERS_TABLE,
            FilterExpression: 'email = :email',
            ExpressionAttributeValues: {
                ':email': email
            }
        };

        const { Items } = await dynamoDB.send(new ScanCommand(scanParams));

        if (Items && Items.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const role = email.endsWith('@duck.com') ? 'admin' : 'user';
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            id: 'USER', // Partition key
            userId: uuidv4(), // Sort key
            name,
            email,
            password: hashedPassword,
            role,
            createdAt: new Date().toISOString()
        };

        const putParams = {
            TableName: process.env.DYNAMODB_USERS_TABLE,
            Item: newUser
        };

        await dynamoDB.send(new PutCommand(putParams));

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Use Scan to find user by email
        const scanParams = {
            TableName: process.env.DYNAMODB_USERS_TABLE,
            FilterExpression: 'email = :email',
            ExpressionAttributeValues: {
                ':email': email
            }
        };

        const { Items } = await dynamoDB.send(new ScanCommand(scanParams));

        if (!Items || Items.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const user = Items[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        // Log the user object to see its structure
        console.log('User object:', user);

        const token = generateToken(user);
        res.json({ token, role: user.role });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/master-login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await dynamoDB.get({
            TableName: process.env.DYNAMODB_USERS_TABLE,
            Key: { email }
        }).promise();

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials or not authorized' });
        }

        const isMatch = await bcrypt.compare(password, user.Item.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (user.Item.twoFactorEnabled) {
            return res.json({ requireTwoFactor: true, email: user.Item.email });
        }

        const token = jwt.sign(
            { userId: user.Item.id, role: user.Item.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token, role: user.Item.role });
    } catch (error) {
        console.error('Master login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/admin-login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await dynamoDB.get({
            TableName: process.env.DYNAMODB_USERS_TABLE,
            Key: { email }
        }).promise();

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials or not authorized' });
        }

        const isMatch = await bcrypt.compare(password, user.Item.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (user.Item.twoFactorEnabled) {
            return res.json({ requireTwoFactor: true, email: user.Item.email });
        }

        const token = jwt.sign(
            { userId: user.Item.id, role: user.Item.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token, role: user.Item.role });
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

const handleSSOCallback = (strategy) => async (req, res) => {
    passport.authenticate(strategy, { failureRedirect: `/api/auth/${strategy}/failure` })(req, res, async (err) => {
        try {
            if (err) {
                console.error(`${strategy} authentication error:`, err);
                throw new Error(`${strategy} authentication failed`);
            }

            if (!req.user) {
                console.error(`${strategy} authentication: User object is undefined`);
                throw new Error('User not authenticated');
            }

            console.log(`${strategy} authentication successful. User:`, req.user);

            const token = generateToken(req.user);
            const role = req.user.role;
            console.log('Token generated successfully. Redirecting to frontend.');
            res.redirect(`${process.env.FRONTEND_URL}/login?token=${token}&role=${role}`);
        } catch (error) {
            console.error('SSO Callback error:', error);
            const errorMessage = encodeURIComponent(`${strategy} authentication failed. Please try again.`);
            res.redirect(`${process.env.FRONTEND_URL}/login?error=${errorMessage}`);
        }
    });
};

const handleSSOFailure = (strategy) => (req, res) => {
    const errorMessage = encodeURIComponent(`${strategy} authentication failed. Please try again.`);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=${errorMessage}`);
};

// GitHub routes (already existing)
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', handleSSOCallback('github'));

// Add Google routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', handleSSOCallback('google'));

// Add Microsoft routes
router.get('/microsoft', passport.authenticate('microsoft', { scope: ['user.read'] }));
router.get('/microsoft/callback', handleSSOCallback('microsoft'));

router.post('/business-sso', async (req, res) => {
    const { businessId } = req.body;

    try {
        // Here you would typically validate the businessId against your database
        // For this example, we'll just check if it's not empty
        if (!businessId) {
            return res.status(400).json({ message: 'Business ID is required' });
        }

        // In a real-world scenario, you'd fetch the user associated with this business ID
        // For now, we'll create a mock user
        const user = {
            _id: 'business_' + businessId,
            role: 'business_user'
        };

        const token = generateToken(user);
        res.json({ token, role: user.role });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;