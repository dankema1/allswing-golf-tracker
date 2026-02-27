import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const projectRoot = join(__dirname, '..', '..');
const dataDir = join(projectRoot, 'data');
const dbPath = join(dataDir, 'allswing.db');
const schemaPath = join(__dirname, 'schema.sql');

// Create data directory if it doesn't exist
try {
  mkdirSync(dataDir, { recursive: true });
} catch (err) {
  if (err.code !== 'EEXIST') throw err;
}

// Initialize database
const db = new Database(dbPath);

// Read and execute schema
const schema = readFileSync(schemaPath, 'utf8');
db.exec(schema);

console.log('✅ Database initialized successfully at:', dbPath);
console.log('📊 Tables created: sessions, shots, session_stats');

// Close database
db.close();
