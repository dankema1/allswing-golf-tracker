/**
 * API Client for AllSwing Golf Tracker
 */

const API_BASE = '/api';

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Session APIs
export const sessionsAPI = {
  /**
   * Create a new practice session
   */
  async create(clubMode, ironType = null) {
    return fetchAPI('/sessions', {
      method: 'POST',
      body: JSON.stringify({ club_mode: clubMode, iron_type: ironType })
    });
  },

  /**
   * Get active session status
   */
  async getActive() {
    return fetchAPI('/sessions/status/active');
  },

  /**
   * Get session by ID
   */
  async getById(sessionId) {
    return fetchAPI(`/sessions/${sessionId}`);
  },

  /**
   * End a session
   */
  async end(sessionId, notes = null) {
    return fetchAPI(`/sessions/${sessionId}/end`, {
      method: 'PUT',
      body: JSON.stringify({ notes })
    });
  },

  /**
   * Get session history
   */
  async getHistory(limit = 50, clubMode = null) {
    const params = new URLSearchParams({ limit });
    if (clubMode) params.append('club_mode', clubMode);
    return fetchAPI(`/sessions?${params}`);
  },

  /**
   * Delete a session
   */
  async delete(sessionId) {
    return fetchAPI(`/sessions/${sessionId}`, {
      method: 'DELETE'
    });
  }
};

// Shots APIs
export const shotsAPI = {
  /**
   * Record a shot
   */
  async record(sessionId, shotType, shotCategory) {
    return fetchAPI('/shots', {
      method: 'POST',
      body: JSON.stringify({
        session_id: sessionId,
        shot_type: shotType,
        shot_category: shotCategory
      })
    });
  },

  /**
   * Get all shots for a session
   */
  async getBySession(sessionId) {
    return fetchAPI(`/shots/session/${sessionId}`);
  },

  /**
   * Delete a shot (undo)
   */
  async delete(shotId) {
    return fetchAPI(`/shots/${shotId}`, {
      method: 'DELETE'
    });
  }
};
