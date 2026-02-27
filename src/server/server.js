import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Database from 'better-sqlite3';
import dotenv from 'dotenv';
import { createSessionsRouter } from './routes/sessions.js';
import { createShotsRouter } from './routes/shots.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Initialize database
const projectRoot = join(__dirname, '..', '..');
const dbPath = join(projectRoot, 'data', 'allswing.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api/sessions', createSessionsRouter(db));
app.use('/api/shots', createShotsRouter(db));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve frontend in production
if (IS_PRODUCTION) {
  const distPath = join(projectRoot, 'dist');
  app.use(express.static(distPath));

  app.get('*', (req, res) => {
    res.sendFile(join(distPath, 'index.html'));
  });
}

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🏌️  AllSwing Golf Tracker API running on port ${PORT}`);
  console.log(`📂 Database: ${dbPath}`);
  console.log(`🌍 Environment: ${IS_PRODUCTION ? 'production' : 'development'}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down gracefully...');
  db.close();
  process.exit(0);
});
