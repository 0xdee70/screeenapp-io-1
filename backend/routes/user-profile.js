const express = require('express');
const router = express.Router();
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, UpdateCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const auth = require('../middleware/authMiddleware');
const dotenv = require('dotenv');
dotenv.config();

// Configure AWS
const client = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const dynamoDB = DynamoDBDocumentClient.from(client);

// Get user profile
router.get('/profile', auth(), async (req, res) => {
    try {
        const params = {
            TableName: process.env.DYNAMODB_USERS_TABLE,
            Key: {
                id: 'USER',
                userId: req.user.userId
            }
        };

        const { Item } = await dynamoDB.send(new GetCommand(params));

        if (!Item) {
            return res.status(404).json({ message: "User not found" });
        }

        // Remove sensitive information
        const { password, ...userProfile } = Item;

        res.json(userProfile);
    } catch (err) {
        console.error('Error fetching user profile:', err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

// Update user profile
router.put('/profile', auth(), async (req, res) => {
    try {
        const { name, email } = req.body;

        // Validate input
        if (!name && !email) {
            return res.status(400).json({ message: "No update data provided" });
        }

        let updateExpression = 'set';
        let expressionAttributeValues = {};
        let expressionAttributeNames = {};

        if (name) {
            updateExpression += ' #n = :name,';
            expressionAttributeValues[':name'] = name;
            expressionAttributeNames['#n'] = 'name';
        }

        if (email) {
            updateExpression += ' #e = :email,';
            expressionAttributeValues[':email'] = email;
            expressionAttributeNames['#e'] = 'email';
        }

        updateExpression += ' updatedAt = :updatedAt';
        expressionAttributeValues[':updatedAt'] = new Date().toISOString();

        const params = {
            TableName: process.env.DYNAMODB_USERS_TABLE,
            Key: {
                id: 'USER',
                userId: req.user.userId
            },
            UpdateExpression: updateExpression,
            ExpressionAttributeValues: expressionAttributeValues,
            ExpressionAttributeNames: expressionAttributeNames,
            ReturnValues: 'ALL_NEW'
        };

        const { Attributes } = await dynamoDB.send(new UpdateCommand(params));

        // Remove sensitive information
        const { password, ...updatedProfile } = Attributes;

        res.json(updatedProfile);
    } catch (err) {
        console.error('Error updating user profile:', err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

// Delete user profile
router.delete('/profile', auth(), async (req, res) => {
    try {
        const params = {
            TableName: process.env.DYNAMODB_USERS_TABLE,
            Key: {
                id: 'USER',
                userId: req.user.userId
            }
        };

        await dynamoDB.send(new DeleteCommand(params));

        res.json({ message: "User profile deleted successfully" });
    } catch (err) {
        console.error('Error deleting user profile:', err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

module.exports = router;
