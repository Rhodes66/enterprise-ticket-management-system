const express = require('express');
const { run, get, all } = require('../db');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();
const validStatuses = ['pending', 'processing', 'resolved', 'closed'];
const validPriorities = ['low', 'medium', 'high', 'urgent'];

async function writeLog(userId, action, targetType, targetId, detail = '') {
  await run(
    'INSERT INTO logs (user_id, action, target_type, target_id, detail) VALUES (?, ?, ?, ?, ?)',
    [userId, action, targetType, targetId, detail]
  );
}

function baseTicketSelect() {
  return `
    SELECT
      t.*,
      creator.name AS creator_name,
      creator.email AS creator_email,
      assignee.name AS assignee_name,
      assignee.email AS assignee_email
    FROM tickets t
    JOIN users creator ON creator.id = t.creator_id
    LEFT JOIN users assignee ON assignee.id = t.assignee_id
  `;
}

router.get('/', authenticate, async (req, res, next) => {
  try {
    const { status, priority, search } = req.query;
    const where = [];
    const params = [];

    if (req.user.role === 'employee') {
      where.push('t.creator_id = ?');
      params.push(req.user.id);
    } else if (req.user.role === 'technician') {
      where.push('(t.assignee_id = ? OR t.assignee_id IS NULL)');
      params.push(req.user.id);
    }

    if (status && validStatuses.includes(status)) {
      where.push('t.status = ?');
      params.push(status);
    }

    if (priority && validPriorities.includes(priority)) {
      where.push('t.priority = ?');
      params.push(priority);
    }

    if (search) {
      where.push('(t.title LIKE ? OR t.description LIKE ? OR t.category LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const sql = `
      ${baseTicketSelect()}
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY
        CASE t.priority WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END,
        t.updated_at DESC,
        t.id DESC
    `;

    const tickets = await all(sql, params);
    res.json({ tickets });
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, async (req, res, next) => {
  try {
    const { title, description, category = 'general', priority = 'medium' } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required.' });
    }

    if (!validPriorities.includes(priority)) {
      return res.status(400).json({ message: 'Invalid priority.' });
    }

    const result = await run(
      `INSERT INTO tickets (title, description, category, priority, creator_id)
       VALUES (?, ?, ?, ?, ?)`,
      [title, description, category, priority, req.user.id]
    );

    await writeLog(req.user.id, 'create_ticket', 'ticket', result.id, title);
    const ticket = await get(`${baseTicketSelect()} WHERE t.id = ?`, [result.id]);
    res.status(201).json({ ticket });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const ticket = await get(`${baseTicketSelect()} WHERE t.id = ?`, [req.params.id]);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found.' });

    const canView =
      req.user.role === 'admin' ||
      ticket.creator_id === req.user.id ||
      req.user.role === 'technician';

    if (!canView) {
      return res.status(403).json({ message: 'You do not have permission to view this ticket.' });
    }

    const comments = await all(
      `SELECT c.*, u.name AS user_name, u.role AS user_role
       FROM comments c
       JOIN users u ON u.id = c.user_id
       WHERE c.ticket_id = ?
       ORDER BY c.created_at ASC`,
      [req.params.id]
    );

    res.json({ ticket, comments });
  } catch (error) {
    next(error);
  }
});

router.put('/:id/assign', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const { assignee_id } = req.body;
    const ticket = await get('SELECT * FROM tickets WHERE id = ?', [req.params.id]);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found.' });

    const technician = await get("SELECT id FROM users WHERE id = ? AND role = 'technician'", [assignee_id]);
    if (!technician) return res.status(400).json({ message: 'Assignee must be a technician.' });

    await run(
      "UPDATE tickets SET assignee_id = ?, status = CASE WHEN status = 'pending' THEN 'processing' ELSE status END, updated_at = datetime('now') WHERE id = ?",
      [assignee_id, req.params.id]
    );

    await writeLog(req.user.id, 'assign_ticket', 'ticket', req.params.id, `Assigned to user ${assignee_id}`);
    const updated = await get(`${baseTicketSelect()} WHERE t.id = ?`, [req.params.id]);
    res.json({ ticket: updated });
  } catch (error) {
    next(error);
  }
});

router.put('/:id/status', authenticate, async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }

    const ticket = await get('SELECT * FROM tickets WHERE id = ?', [req.params.id]);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found.' });

    const canUpdate =
      req.user.role === 'admin' ||
      (req.user.role === 'technician' && (!ticket.assignee_id || ticket.assignee_id === req.user.id)) ||
      (req.user.role === 'employee' && ticket.creator_id === req.user.id && status === 'closed');

    if (!canUpdate) {
      return res.status(403).json({ message: 'You do not have permission to update this ticket.' });
    }

    const closedAt = status === 'closed' ? ", closed_at = datetime('now')" : '';
    await run(
      `UPDATE tickets SET status = ?, updated_at = datetime('now') ${closedAt} WHERE id = ?`,
      [status, req.params.id]
    );

    await writeLog(req.user.id, 'update_status', 'ticket', req.params.id, `Status changed to ${status}`);
    const updated = await get(`${baseTicketSelect()} WHERE t.id = ?`, [req.params.id]);
    res.json({ ticket: updated });
  } catch (error) {
    next(error);
  }
});

router.put('/:id/priority', authenticate, requireRole('admin', 'technician'), async (req, res, next) => {
  try {
    const { priority } = req.body;
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({ message: 'Invalid priority.' });
    }

    const ticket = await get('SELECT * FROM tickets WHERE id = ?', [req.params.id]);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found.' });

    await run(
      "UPDATE tickets SET priority = ?, updated_at = datetime('now') WHERE id = ?",
      [priority, req.params.id]
    );

    await writeLog(req.user.id, 'update_priority', 'ticket', req.params.id, `Priority changed to ${priority}`);
    const updated = await get(`${baseTicketSelect()} WHERE t.id = ?`, [req.params.id]);
    res.json({ ticket: updated });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/comments', authenticate, async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: 'Comment content is required.' });

    const ticket = await get('SELECT * FROM tickets WHERE id = ?', [req.params.id]);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found.' });

    const canComment =
      req.user.role === 'admin' ||
      ticket.creator_id === req.user.id ||
      req.user.role === 'technician';

    if (!canComment) {
      return res.status(403).json({ message: 'You do not have permission to comment on this ticket.' });
    }

    const result = await run(
      'INSERT INTO comments (ticket_id, user_id, content) VALUES (?, ?, ?)',
      [req.params.id, req.user.id, content]
    );

    await run("UPDATE tickets SET updated_at = datetime('now') WHERE id = ?", [req.params.id]);
    await writeLog(req.user.id, 'add_comment', 'ticket', req.params.id, content.slice(0, 120));

    const comment = await get(
      `SELECT c.*, u.name AS user_name, u.role AS user_role
       FROM comments c
       JOIN users u ON u.id = c.user_id
       WHERE c.id = ?`,
      [result.id]
    );

    res.status(201).json({ comment });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
