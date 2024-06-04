const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized: Token is missing' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        req.user = {
            userId: decoded.id,
            role: decoded.role
        };
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};

const checkAdminRole = (req, res, next) => {
    if (req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
};

const checkRole = (req, res, next) => {
    if (req.user.role === 'admin' || req.user.role === 'user') {
        next();
    } else {
        return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
};

module.exports = { verifyToken, checkAdminRole };
