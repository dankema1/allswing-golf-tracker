/**
 * PracticeSession class - manages active practice session state
 */

import { sessionsAPI, shotsAPI } from './api.js';

export class PracticeSession {
  constructor() {
    this.sessionId = null;
    this.clubMode = null;
    this.ironType = null;
    this.shots = [];
    this.lastShotId = null;
  }

  /**
   * Start a new practice session
   */
  async startSession(clubMode, ironType = null) {
    try {
      const session = await sessionsAPI.create(clubMode, ironType);

      this.sessionId = session.id;
      this.clubMode = clubMode;
      this.ironType = ironType;
      this.shots = [];
      this.lastShotId = null;

      // Save to localStorage for session resume
      this.saveToLocalStorage();

      return session;
    } catch (error) {
      console.error('Failed to start session:', error);
      throw error;
    }
  }

  /**
   * Record a shot
   */
  async recordShot(shotType, shotCategory) {
    try {
      const result = await shotsAPI.record(this.sessionId, shotType, shotCategory);

      // Add to local shots array
      this.shots.push({
        id: result.id,
        shot_type: shotType,
        shot_category: shotCategory,
        timestamp: new Date().toISOString()
      });

      this.lastShotId = result.id;
      this.saveToLocalStorage();

      return result;
    } catch (error) {
      console.error('Failed to record shot:', error);
      throw error;
    }
  }

  /**
   * Undo the last shot
   */
  async undoLastShot() {
    if (!this.lastShotId) {
      throw new Error('No shot to undo');
    }

    try {
      const result = await shotsAPI.delete(this.lastShotId);

      // Remove from local shots array
      this.shots = this.shots.filter(s => s.id !== this.lastShotId);

      // Update lastShotId to the new last shot
      if (this.shots.length > 0) {
        this.lastShotId = this.shots[this.shots.length - 1].id;
      } else {
        this.lastShotId = null;
      }

      this.saveToLocalStorage();

      return result;
    } catch (error) {
      console.error('Failed to undo shot:', error);
      throw error;
    }
  }

  /**
   * End the current session
   */
  async endSession(notes = null) {
    try {
      const result = await sessionsAPI.end(this.sessionId, notes);

      // Clear localStorage
      this.clearLocalStorage();

      return result;
    } catch (error) {
      console.error('Failed to end session:', error);
      throw error;
    }
  }

  /**
   * Calculate live statistics
   */
  calculateLiveStats() {
    const stats = {
      pure_count: 0,
      hook_count: 0,
      leak_left_count: 0,
      slight_right_count: 0,
      slice_count: 0,
      top_count: 0,
      chunk_count: 0,
      hosel_count: 0,
      make_count: 0,
      miss_count: 0,
      hammered_count: 0,
      speed_make_count: 0,
      gimme_count: 0,
      babied_count: 0,
      on_target_count: 0,
      left_count: 0,
      right_count: 0,
      short_count: 0,
      long_count: 0,
      pure_percentage: 0,
      total_shots: this.shots.length,
      recent_shots: []
    };

    this.shots.forEach(shot => {
      const type = shot.shot_type.toLowerCase();
      switch(type) {
        case 'pure': stats.pure_count++; break;
        case 'hook': stats.hook_count++; break;
        case 'leak_left': stats.leak_left_count++; break;
        case 'slight_right': stats.slight_right_count++; break;
        case 'slice': stats.slice_count++; break;
        case 'top': stats.top_count++; break;
        case 'chunk': stats.chunk_count++; break;
        case 'hosel': stats.hosel_count++; break;
        case 'make': stats.make_count++; break;
        case 'miss': stats.miss_count++; break;
        case 'hammered': stats.hammered_count++; break;
        case 'speed_make': stats.speed_make_count++; break;
        case 'gimme': stats.gimme_count++; break;
        case 'babied': stats.babied_count++; break;
        case 'on_target': stats.on_target_count++; break;
        case 'left': stats.left_count++; break;
        case 'right': stats.right_count++; break;
        case 'short': stats.short_count++; break;
        case 'long': stats.long_count++; break;
      }
    });

    if (this.shots.length > 0) {
      // Calculate "good shots" based on context
      // For putting speed: make + gimme
      // For accuracy: on_target
      // For contact: pure
      const goodShots = stats.pure_count + stats.on_target_count + stats.speed_make_count + stats.gimme_count;
      stats.pure_percentage = Math.round((goodShots / this.shots.length) * 100 * 10) / 10;
    }

    // Get last 5 shots
    stats.recent_shots = this.shots.slice(-5).reverse().map(s => ({
      type: s.shot_type,
      category: s.shot_category
    }));

    return stats;
  }

  /**
   * Get club display name
   */
  getClubDisplay() {
    if (this.clubMode === 'iron' && this.ironType) {
      return `${this.ironType.toUpperCase()}`;
    }
    return this.clubMode.charAt(0).toUpperCase() + this.clubMode.slice(1);
  }

  /**
   * Save session state to localStorage
   */
  saveToLocalStorage() {
    const state = {
      sessionId: this.sessionId,
      clubMode: this.clubMode,
      ironType: this.ironType,
      shots: this.shots,
      lastShotId: this.lastShotId
    };
    localStorage.setItem('activeSession', JSON.stringify(state));
  }

  /**
   * Load session state from localStorage
   */
  loadFromLocalStorage() {
    const stored = localStorage.getItem('activeSession');
    if (stored) {
      const state = JSON.parse(stored);
      this.sessionId = state.sessionId;
      this.clubMode = state.clubMode;
      this.ironType = state.ironType;
      this.shots = state.shots || [];
      this.lastShotId = state.lastShotId;
      return true;
    }
    return false;
  }

  /**
   * Clear localStorage
   */
  clearLocalStorage() {
    localStorage.removeItem('activeSession');
  }

  /**
   * Check if there's an active session
   */
  hasActiveSession() {
    return this.sessionId !== null;
  }
}
