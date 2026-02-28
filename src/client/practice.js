/**
 * PracticeSession class - manages active practice session state
 * All data stored in browser localStorage (no backend API calls)
 */

export class PracticeSession {
  constructor() {
    this.sessionId = null;
    this.clubMode = null;
    this.ironType = null;
    this.shots = [];
    this.lastShotId = null;
    this.startedAt = null;
  }

  /**
   * Start a new practice session
   */
  async startSession(clubMode, ironType = null) {
    try {
      // Generate a unique session ID based on timestamp
      this.sessionId = `session_${Date.now()}`;
      this.clubMode = clubMode;
      this.ironType = ironType;
      this.shots = [];
      this.lastShotId = null;
      this.startedAt = new Date().toISOString();

      // Save to localStorage for session resume
      this.saveToLocalStorage();

      return {
        id: this.sessionId,
        club_mode: clubMode,
        iron_type: ironType,
        started_at: this.startedAt
      };
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
      // Generate shot ID
      const shotId = `shot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Add to local shots array
      this.shots.push({
        id: shotId,
        shot_type: shotType,
        shot_category: shotCategory,
        timestamp: new Date().toISOString()
      });

      this.lastShotId = shotId;
      this.saveToLocalStorage();

      return { id: shotId };
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
      // Remove from local shots array
      this.shots = this.shots.filter(s => s.id !== this.lastShotId);

      // Update lastShotId to the new last shot
      if (this.shots.length > 0) {
        this.lastShotId = this.shots[this.shots.length - 1].id;
      } else {
        this.lastShotId = null;
      }

      this.saveToLocalStorage();

      return { success: true };
    } catch (error) {
      console.error('Failed to undo shot:', error);
      throw error;
    }
  }

  /**
   * End the current session and save to history
   */
  async endSession(notes = null) {
    try {
      const endedAt = new Date().toISOString();
      const stats = this.calculateLiveStats();

      // Create completed session object
      const completedSession = {
        id: this.sessionId,
        club_mode: this.clubMode,
        iron_type: this.ironType,
        started_at: this.startedAt,
        ended_at: endedAt,
        total_shots: this.shots.length,
        notes: notes,
        shots: this.shots,
        stats: stats
      };

      // Save to session history
      this.saveToHistory(completedSession);

      // Clear active session
      this.clearLocalStorage();

      return { success: true, session: completedSession };
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
        // For putting make/miss: make
        // For putting speed: speed_make + gimme
        // For accuracy: on_target
        // For contact: pure
        const goodShots = stats.pure_count + stats.on_target_count + stats.speed_make_count + stats.gimme_count + stats.make_count;
        stats.pure_percentage = Math.round((goodShots / this.shots.length) * 100 * 10) / 10;
      }

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
   * Save session state to localStorage (active session)
   */
  saveToLocalStorage() {
    const state = {
      sessionId: this.sessionId,
      clubMode: this.clubMode,
      ironType: this.ironType,
      shots: this.shots,
      lastShotId: this.lastShotId,
      startedAt: this.startedAt
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
      this.startedAt = state.startedAt;
      return true;
    }
    return false;
  }

  /**
   * Clear active session from localStorage
   */
  clearLocalStorage() {
    localStorage.removeItem('activeSession');
  }

  /**
   * Save completed session to history
   */
  saveToHistory(session) {
    // Get existing history
    const history = this.getHistory();

    // Add new session to beginning (most recent first)
    history.unshift(session);

    // Save back to localStorage
    localStorage.setItem('sessionHistory', JSON.stringify(history));
  }

  /**
   * Get all sessions from history
   */
  getHistory() {
    const stored = localStorage.getItem('sessionHistory');
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  }

  /**
   * Delete a session from history
   */
  deleteFromHistory(sessionId) {
    const history = this.getHistory();
    const filtered = history.filter(s => s.id !== sessionId);
    localStorage.setItem('sessionHistory', JSON.stringify(filtered));
  }

  /**
   * Check if there's an active session
   */
  hasActiveSession() {
    return this.sessionId !== null;
  }
}

