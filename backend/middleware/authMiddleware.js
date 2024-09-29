const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const authenticate = (requiredRole) => (req, res, next) => {
    const token = req.header('Authorization').replace('Bearer ', '');

    if (!token) return res.status(401).json({ message: 'No token provided' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (requiredRole === 'master_admin' && decoded.role !== 'master_admin') {
            return res.status(403).json({ message: 'Access denied. Master Admin privileges required.' });
        }

        if (requiredRole === 'admin' && !['admin', 'master_admin'].includes(decoded.role)) {
            return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
        }

        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};

module.exports = authenticate;
