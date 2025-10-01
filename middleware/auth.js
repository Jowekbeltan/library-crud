const jwt = require('jsonwebtoken');

// Change this to a more secure secret in production!
const JWT_SECRET = 'your-super-secret-jwt-key-ChangeThisInProduction123';

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Access token required. Please log in.' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token. Please log in again.' });
        }
        req.user = user;
        next();
    });
}

module.exports = { authenticateToken };