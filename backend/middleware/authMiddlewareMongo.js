const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const authenticate = (requiredRole) => (req, res, next) => {
    console.log("Headers:", req.headers);  // Log all headers
    const authHeader = req.header('Authorization');
    console.log("Auth header:", authHeader);  // Log the Authorization header

    if (!authHeader) {
        console.log("No Authorization header provided");
        return res.status(401).json({ message: 'No Authorization header provided' });
    }

    const token = authHeader.replace('Bearer ', '');
    console.log("Token:", token);  // Log the extracted token

    if (!token) {
        console.log("No token provided");
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded token:", decoded);  // Log the decoded token

        if (requiredRole === 'master_admin' && decoded.role !== 'master_admin') {
            return res.status(403).json({ message: 'Access denied. Master Admin privileges required.' });
        }

        if (requiredRole === 'admin' && !['admin', 'master_admin'].includes(decoded.role)) {
            return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
        }

        req.user = decoded;
        next();
    } catch (err) {
        console.error('Token verification error:', err);
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};

module.exports = authenticate;
