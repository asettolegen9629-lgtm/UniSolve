require('./loadEnv');
try {
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl) {
    const u = new URL(dbUrl.replace(/^postgresql:/, 'http:'));
    console.log(`[config] DB host (from .env file): ${u.hostname}`);
  }
} catch {
  /* ignore malformed DATABASE_URL in logs */
}

const prisma = require('./prismaClient');

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-clerk-user-id', 'x-clerk-email', 'x-clerk-username', 'x-clerk-full-name'],
  credentials: false
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, {
    headers: {
      'x-clerk-user-id': req.headers['x-clerk-user-id'],
      'x-clerk-email': req.headers['x-clerk-email']
    }
  });
  next();
});

app.use('/uploads', express.static('uploads'));

const uploadsDir = path.join(__dirname, 'uploads');
// Small safety step: create uploads folder automatically on first run.
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const userRoutes = require('./routes/users');
const reportRoutes = require('./routes/reports');
const commentRoutes = require('./routes/comments');
const likeRoutes = require('./routes/likes');
const notificationRoutes = require('./routes/notifications');
const feedbackRoutes = require('./routes/feedback');

app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/feedback', feedbackRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.get('/health/db', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    let dbHost = 'unknown';
    try {
      const dbUrl = process.env.DATABASE_URL || '';
      dbHost = new URL(dbUrl.replace(/^postgresql:/, 'http:')).hostname;
    } catch (_) {
      /* ignore */
    }
    res.json({ ok: true, dbHost });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e.message || e) });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

