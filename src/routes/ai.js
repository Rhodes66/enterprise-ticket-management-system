const express = require('express');
const { get, run } = require('../db');
const { authenticate, requireRole } = require('../middleware/auth');
const { generateSummary, suggestPriority, generateSolutionSuggestion } = require('../utils/ai');

const router = express.Router();

async function findTicket(id) {
  return get(
    `SELECT t.*, creator.name AS creator_name, assignee.name AS assignee_name
     FROM tickets t
     JOIN users creator ON creator.id = t.creator_id
     LEFT JOIN users assignee ON assignee.id = t.assignee_id
     WHERE t.id = ?`,
    [id]
  );
}

router.post('/tickets/:id/summary', authenticate, requireRole('admin', 'technician'), async (req, res, next) => {
  try {
    const ticket = await findTicket(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found.' });

    const summary = await generateSummary(ticket);
    await run("UPDATE tickets SET ai_summary = ?, updated_at = datetime('now') WHERE id = ?", [summary, req.params.id]);
    res.json({ summary });
  } catch (error) {
    next(error);
  }
});

router.post('/tickets/:id/priority', authenticate, requireRole('admin', 'technician'), async (req, res, next) => {
  try {
    const ticket = await findTicket(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found.' });

    const priority = await suggestPriority(ticket);
    await run("UPDATE tickets SET ai_priority = ?, updated_at = datetime('now') WHERE id = ?", [priority, req.params.id]);
    res.json({ priority });
  } catch (error) {
    next(error);
  }
});

router.post('/tickets/:id/suggestion', authenticate, requireRole('admin', 'technician'), async (req, res, next) => {
  try {
    const ticket = await findTicket(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found.' });

    const suggestion = await generateSolutionSuggestion(ticket);
    res.json({ suggestion });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
