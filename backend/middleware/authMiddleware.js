const jwt = require('jsonwebtoken');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');
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

const authenticate = (requiredRole) => async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) return res.status(401).json({ message: 'No token provided' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch user from DynamoDB
        const params = {
            TableName: process.env.DYNAMODB_USERS_TABLE,
            Key: {
                id: 'USER',
                userId: decoded.userId
            }
        };

        const { Item: user } = await dynamoDB.send(new GetCommand(params));

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        if (requiredRole && user.role !== requiredRole) {
            return res.status(403).json({ message: 'Access denied. Insufficient privileges.' });
        }

        req.user = user;
        next();
    } catch (err) {
        console.error('Authentication error:', err);
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};

module.exports = authenticate;
