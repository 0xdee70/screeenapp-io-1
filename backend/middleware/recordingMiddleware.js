const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const recordingMiddleware = (req, res, next) => {
    let token = req.header('Authorization')?.replace('Bearer ', '');

    // If no token in header, check query parameters
    if (!token) {
        token = req.query.token;
    }

    if (!token) {
        return res.status(401).json({ message: 'Authorization token missing' });
    }

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decodedToken.userId;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = recordingMiddleware;