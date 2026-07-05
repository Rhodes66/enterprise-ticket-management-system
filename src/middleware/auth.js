const jwt = require('jsonwebtoken');
const { get } = require('../db');
require('dotenv').config();

const jwtSecret = process.env.JWT_SECRET || 'dev_secret_change_me';

async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: 'Missing authorization token.' });
    }

    const payload = jwt.verify(token, jwtSecret);
    const user = await get(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [payload.id]
    );

    if (!user) {
      return res.status(401).json({ message: 'Invalid authorization token.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Authentication failed.' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to perform this action.' });
    }
    next();
  };
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    jwtSecret,
    { expiresIn: '8h' }
  );
}

module.exports = {
  authenticate,
  requireRole,
  signToken
};
