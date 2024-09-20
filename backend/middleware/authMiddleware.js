const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const authenticate = (role) => (req, res, next) => {
    const token = req.header('Authorization').replace('Bearer ', '');

    if (!token) return res.status(401).json({ message: 'No token provided' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (role && decoded.role !== role) {
            return res.status(403).json({ message: 'Access denied' });
        }
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};

module.exports = authenticate;
