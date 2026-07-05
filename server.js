const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { initDatabase } = require('./src/db');

const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const ticketRoutes = require('./src/routes/tickets');
const dashboardRoutes = require('./src/routes/dashboard');
const aiRoutes = require('./src/routes/ai');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'Enterprise Ticket Management System' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai', aiRoutes);

app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ message: 'API route not found.' });
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: error.message || 'Internal server error.' });
});

initDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
      console.log('Demo accounts:');
      console.log('Admin: admin@example.com / admin123');
      console.log('Technician: tech@example.com / tech123');
      console.log('Employee: employee@example.com / emp123');
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });
