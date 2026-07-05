const express = require('express');
const bcrypt = require('bcryptjs');
const { run, get } = require('../db');
const { authenticate, signToken } = require('../middleware/auth');

const router = express.Router();
const allowedRoles = ['employee', 'technician', 'admin'];

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role = 'employee' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role.' });
    }

    const existing = await get('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) {
      return res.status(409).json({ message: 'Email already exists.' });
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await run(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email, hash, role]
    );

    const user = await get(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [result.id]
    );

    res.status(201).json({ user, token: signToken(user) });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const userRecord = await get('SELECT * FROM users WHERE email = ?', [email]);
    if (!userRecord) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const ok = await bcrypt.compare(password, userRecord.password_hash);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = {
      id: userRecord.id,
      name: userRecord.name,
      email: userRecord.email,
      role: userRecord.role,
      created_at: userRecord.created_at
    };

    res.json({ user, token: signToken(user) });
  } catch (error) {
    next(error);
  }
});

router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
