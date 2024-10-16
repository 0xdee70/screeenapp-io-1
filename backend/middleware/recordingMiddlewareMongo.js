const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const recordingMiddleware = (req, res, next) => {
    console.log("Entering recordingMiddleware");
    console.log("Headers in middleware:", req.headers);

    let token = req.header('Authorization')?.replace('Bearer ', '');

    console.log("Token in middleware:", token);

    if (!token) {
        console.log("No token found in Authorization header");
        return res.status(401).json({ message: 'Authorization token missing' });
    }

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded token:", decodedToken);
        req.userId = decodedToken.id;
        console.log("Set req.userId to:", req.userId);
        next();
    } catch (error) {
        console.error("Token verification error:", error);
        return res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = recordingMiddleware;