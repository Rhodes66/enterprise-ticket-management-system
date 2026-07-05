const express = require('express');
const { all } = require('../db');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/technicians', authenticate, requireRole('admin', 'technician'), async (req, res, next) => {
  try {
    const technicians = await all(
      "SELECT id, name, email, role FROM users WHERE role = 'technician' ORDER BY name ASC"
    );
    res.json({ technicians });
  } catch (error) {
    next(error);
  }
});

router.get('/', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const users = await all('SELECT id, name, email, role, created_at FROM users ORDER BY id ASC');
    res.json({ users });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
