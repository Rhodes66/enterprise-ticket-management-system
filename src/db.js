const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
require('dotenv').config();

const dbFile = process.env.DB_FILE || './data/tickets.db';
const dbPath = path.resolve(process.cwd(), dbFile);
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath);

db.run('PRAGMA foreign_keys = ON');

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function callback(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function createTables() {
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('employee', 'technician', 'admin')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'general',
      priority TEXT NOT NULL DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high', 'urgent')),
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'resolved', 'closed')),
      creator_id INTEGER NOT NULL,
      assignee_id INTEGER,
      ai_summary TEXT,
      ai_priority TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      closed_at TEXT,
      FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      action TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id INTEGER,
      detail TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);
}

async function seedUsersAndTickets() {
  const count = await get('SELECT COUNT(*) AS count FROM users');
  if (count.count > 0) return;

  const demoUsers = [
    ['Admin User', 'admin@example.com', 'admin123', 'admin'],
    ['Tech Support', 'tech@example.com', 'tech123', 'technician'],
    ['Employee User', 'employee@example.com', 'emp123', 'employee']
  ];

  const userIds = {};
  for (const [name, email, password, role] of demoUsers) {
    const hash = await bcrypt.hash(password, 10);
    const result = await run(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email, hash, role]
    );
    userIds[email] = result.id;
  }

  const tickets = [
    {
      title: 'VPN 登录失败，提示账号权限异常',
      description: '外出办公时无法登录公司 VPN，输入账号密码后提示权限异常，影响远程访问内部系统。',
      category: 'account',
      priority: 'high',
      status: 'processing',
      creator: userIds['employee@example.com'],
      assignee: userIds['tech@example.com']
    },
    {
      title: '办公电脑开机速度明显变慢',
      description: '最近一周电脑启动时间超过五分钟，打开常用办公软件也比较卡顿。',
      category: 'hardware',
      priority: 'medium',
      status: 'pending',
      creator: userIds['employee@example.com'],
      assignee: null
    },
    {
      title: '财务系统导出报表失败',
      description: '点击导出月度报表后页面长时间无响应，刷新后仍然无法下载文件。',
      category: 'system',
      priority: 'urgent',
      status: 'pending',
      creator: userIds['employee@example.com'],
      assignee: null
    }
  ];

  for (const ticket of tickets) {
    await run(
      `INSERT INTO tickets (title, description, category, priority, status, creator_id, assignee_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [ticket.title, ticket.description, ticket.category, ticket.priority, ticket.status, ticket.creator, ticket.assignee]
    );
  }
}

async function initDatabase() {
  await createTables();
  await seedUsersAndTickets();
}

async function resetDatabase() {
  await run('DROP TABLE IF EXISTS logs');
  await run('DROP TABLE IF EXISTS comments');
  await run('DROP TABLE IF EXISTS tickets');
  await run('DROP TABLE IF EXISTS users');
  await initDatabase();
  console.log('Database reset successfully.');
}

module.exports = {
  db,
  run,
  get,
  all,
  initDatabase,
  resetDatabase
};
