const express = require('express');
const { all, get } = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/stats', authenticate, async (req, res, next) => {
  try {
    const where = [];
    const params = [];

    if (req.user.role === 'employee') {
      where.push('creator_id = ?');
      params.push(req.user.id);
    } else if (req.user.role === 'technician') {
      where.push('(assignee_id = ? OR assignee_id IS NULL)');
      params.push(req.user.id);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const total = await get(`SELECT COUNT(*) AS value FROM tickets ${whereSql}`, params);
    const pending = await get(`SELECT COUNT(*) AS value FROM tickets ${whereSql ? `${whereSql} AND` : 'WHERE'} status = 'pending'`, params);
    const processing = await get(`SELECT COUNT(*) AS value FROM tickets ${whereSql ? `${whereSql} AND` : 'WHERE'} status = 'processing'`, params);
    const resolved = await get(`SELECT COUNT(*) AS value FROM tickets ${whereSql ? `${whereSql} AND` : 'WHERE'} status = 'resolved'`, params);
    const urgent = await get(`SELECT COUNT(*) AS value FROM tickets ${whereSql ? `${whereSql} AND` : 'WHERE'} priority = 'urgent'`, params);

    const statusDistribution = await all(
      `SELECT status, COUNT(*) AS count FROM tickets ${whereSql} GROUP BY status`,
      params
    );

    const priorityDistribution = await all(
      `SELECT priority, COUNT(*) AS count FROM tickets ${whereSql} GROUP BY priority`,
      params
    );

    const trend = await all(
      `SELECT substr(created_at, 1, 10) AS date, COUNT(*) AS count
       FROM tickets
       ${whereSql}
       GROUP BY substr(created_at, 1, 10)
       ORDER BY date ASC
       LIMIT 14`,
      params
    );

    const technicianRanking = req.user.role === 'admin'
      ? await all(
          `SELECT u.name, COUNT(t.id) AS count
           FROM users u
           LEFT JOIN tickets t ON t.assignee_id = u.id
           WHERE u.role = 'technician'
           GROUP BY u.id
           ORDER BY count DESC, u.name ASC
           LIMIT 8`
        )
      : [];

    res.json({
      cards: {
        total: total.value,
        pending: pending.value,
        processing: processing.value,
        resolved: resolved.value,
        urgent: urgent.value
      },
      statusDistribution,
      priorityDistribution,
      trend,
      technicianRanking
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
