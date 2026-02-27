import express from 'express';
import { calculateSessionStats } from '../utils/analytics.js';

export function createSessionsRouter(db) {
  const router = express.Router();

  // Create new session
  router.post('/', (req, res) => {
    try {
      const { club_mode, iron_type } = req.body;

      // Validate club_mode
      if (!['driver', 'iron', 'wedge', 'putter'].includes(club_mode)) {
        return res.status(400).json({ error: 'Invalid club_mode' });
      }

      // Deactivate any active sessions
      const deactivate = db.prepare('UPDATE sessions SET is_active = 0 WHERE is_active = 1');
      deactivate.run();

      // Create new session
      const insert = db.prepare(`
        INSERT INTO sessions (club_mode, iron_type, started_at, is_active)
        VALUES (?, ?, datetime('now'), 1)
      `);

      const result = insert.run(club_mode, iron_type || null);

      res.json({
        id: result.lastInsertRowid,
        club_mode,
        iron_type,
        total_shots: 0,
        is_active: true
      });
    } catch (error) {
      console.error('Error creating session:', error);
      res.status(500).json({ error: 'Failed to create session' });
    }
  });

  // Get active session
  router.get('/status/active', (req, res) => {
    try {
      const stmt = db.prepare(`
        SELECT * FROM sessions
        WHERE is_active = 1
        ORDER BY started_at DESC
        LIMIT 1
      `);

      const session = stmt.get();

      if (!session) {
        return res.json({ active: false });
      }

      // Get shots for this session
      const shotsStmt = db.prepare('SELECT * FROM shots WHERE session_id = ? ORDER BY timestamp ASC');
      const shots = shotsStmt.all(session.id);

      res.json({
        active: true,
        session: {
          ...session,
          shots
        }
      });
    } catch (error) {
      console.error('Error getting active session:', error);
      res.status(500).json({ error: 'Failed to get active session' });
    }
  });

  // Get session by ID
  router.get('/:id', (req, res) => {
    try {
      const sessionId = req.params.id;

      const sessionStmt = db.prepare('SELECT * FROM sessions WHERE id = ?');
      const session = sessionStmt.get(sessionId);

      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      const shotsStmt = db.prepare('SELECT * FROM shots WHERE session_id = ? ORDER BY timestamp ASC');
      const shots = shotsStmt.all(sessionId);

      const statsStmt = db.prepare('SELECT * FROM session_stats WHERE session_id = ?');
      const stats = statsStmt.get(sessionId);

      res.json({
        ...session,
        shots,
        stats
      });
    } catch (error) {
      console.error('Error getting session:', error);
      res.status(500).json({ error: 'Failed to get session' });
    }
  });

  // End session
  router.put('/:id/end', (req, res) => {
    try {
      const sessionId = req.params.id;
      const { notes } = req.body;

      // Get session shots
      const shotsStmt = db.prepare('SELECT * FROM shots WHERE session_id = ?');
      const shots = shotsStmt.all(sessionId);

      // Calculate stats
      const stats = calculateSessionStats(shots);

      // Update session
      const updateSession = db.prepare(`
        UPDATE sessions
        SET ended_at = datetime('now'),
            is_active = 0,
            total_shots = ?,
            notes = ?
        WHERE id = ?
      `);
      updateSession.run(shots.length, notes || null, sessionId);

      // Insert or replace stats
      const insertStats = db.prepare(`
        INSERT OR REPLACE INTO session_stats (
          session_id, pure_count, hook_count, leak_left_count, slight_right_count, slice_count,
          top_count, chunk_count, hosel_count, make_count, miss_count,
          hammered_count, speed_make_count, gimme_count, babied_count,
          on_target_count, left_count, right_count, short_count, long_count, pure_percentage
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      insertStats.run(
        sessionId,
        stats.pure_count,
        stats.hook_count,
        stats.leak_left_count,
        stats.slight_right_count,
        stats.slice_count,
        stats.top_count,
        stats.chunk_count,
        stats.hosel_count,
        stats.make_count,
        stats.miss_count,
        stats.hammered_count,
        stats.speed_make_count,
        stats.gimme_count,
        stats.babied_count,
        stats.on_target_count,
        stats.left_count,
        stats.right_count,
        stats.short_count,
        stats.long_count,
        stats.pure_percentage
      );

      // Get updated session
      const sessionStmt = db.prepare('SELECT * FROM sessions WHERE id = ?');
      const session = sessionStmt.get(sessionId);

      res.json({
        ...session,
        stats
      });
    } catch (error) {
      console.error('Error ending session:', error);
      res.status(500).json({ error: 'Failed to end session' });
    }
  });

  // Get session history
  router.get('/', (req, res) => {
    try {
      const { limit = 50, club_mode } = req.query;

      let query = `
        SELECT s.*, st.pure_percentage
        FROM sessions s
        LEFT JOIN session_stats st ON s.id = st.session_id
        WHERE s.is_active = 0
      `;

      const params = [];

      if (club_mode) {
        query += ' AND s.club_mode = ?';
        params.push(club_mode);
      }

      query += ' ORDER BY s.started_at DESC LIMIT ?';
      params.push(parseInt(limit));

      const stmt = db.prepare(query);
      const sessions = stmt.all(...params);

      res.json(sessions);
    } catch (error) {
      console.error('Error getting session history:', error);
      res.status(500).json({ error: 'Failed to get session history' });
    }
  });

  // Delete session
  router.delete('/:id', (req, res) => {
    try {
      const sessionId = req.params.id;

      // Delete shots (cascade)
      db.prepare('DELETE FROM shots WHERE session_id = ?').run(sessionId);
      // Delete stats
      db.prepare('DELETE FROM session_stats WHERE session_id = ?').run(sessionId);
      // Delete session
      db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);

      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting session:', error);
      res.status(500).json({ error: 'Failed to delete session' });
    }
  });

  return router;
}
