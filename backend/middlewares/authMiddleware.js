const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { isBlacklisted } = require('../utils/tokenBlacklist');

const protect = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token, authorization denied'});
    }

    const token = authHeader.split(' ')[1];
    if (isBlacklisted(token)) {
        return res.status(401).json({ message: 'Token revoked' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }

        req.tokenPayload = decoded;
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.isBlocked) {
            return res.status(403).json({ message: 'Account blocked' });
        }
        
        req.user = user;
        next();
    } catch (error) {
        console.error(error);
        return res.status(401).json({ message: 'No token, authorization denied'});
    }
};

const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }
        next();
    };
};

module.exports = { protect, restrictTo };