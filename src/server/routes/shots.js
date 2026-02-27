import express from 'express';
import { getLiveStats } from '../utils/analytics.js';

export function createShotsRouter(db) {
  const router = express.Router();

  // Record a shot
  router.post('/', (req, res) => {
    try {
      const { session_id, shot_type, shot_category } = req.body;

      // Validate shot_category
      if (!['ball_flight', 'mishit', 'putt', 'putt_speed', 'accuracy'].includes(shot_category)) {
        return res.status(400).json({ error: 'Invalid shot_category' });
      }

      // Insert shot
      const insert = db.prepare(`
        INSERT INTO shots (session_id, shot_type, shot_category, timestamp)
        VALUES (?, ?, ?, datetime('now'))
      `);

      const result = insert.run(session_id, shot_type, shot_category);

      // Get all shots for live stats
      const shotsStmt = db.prepare('SELECT * FROM shots WHERE session_id = ? ORDER BY timestamp ASC');
      const allShots = shotsStmt.all(session_id);

      // Calculate live stats
      const liveStats = getLiveStats(allShots);

      res.json({
        id: result.lastInsertRowid,
        session_id,
        shot_type,
        shot_category,
        live_stats: liveStats
      });
    } catch (error) {
      console.error('Error recording shot:', error);
      res.status(500).json({ error: 'Failed to record shot' });
    }
  });

  // Get all shots for a session
  router.get('/session/:sessionId', (req, res) => {
    try {
      const sessionId = req.params.sessionId;

      const stmt = db.prepare('SELECT * FROM shots WHERE session_id = ? ORDER BY timestamp ASC');
      const shots = stmt.all(sessionId);

      res.json(shots);
    } catch (error) {
      console.error('Error getting shots:', error);
      res.status(500).json({ error: 'Failed to get shots' });
    }
  });

  // Delete a shot (undo)
  router.delete('/:id', (req, res) => {
    try {
      const shotId = req.params.id;

      // Get session_id before deleting
      const getShot = db.prepare('SELECT session_id FROM shots WHERE id = ?');
      const shot = getShot.get(shotId);

      if (!shot) {
        return res.status(404).json({ error: 'Shot not found' });
      }

      // Delete the shot
      const deleteStmt = db.prepare('DELETE FROM shots WHERE id = ?');
      deleteStmt.run(shotId);

      // Get remaining shots for live stats
      const shotsStmt = db.prepare('SELECT * FROM shots WHERE session_id = ? ORDER BY timestamp ASC');
      const allShots = shotsStmt.all(shot.session_id);

      // Calculate updated live stats
      const liveStats = getLiveStats(allShots);

      res.json({
        success: true,
        live_stats: liveStats
      });
    } catch (error) {
      console.error('Error deleting shot:', error);
      res.status(500).json({ error: 'Failed to delete shot' });
    }
  });

  return router;
}
