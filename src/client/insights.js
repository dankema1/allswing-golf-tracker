/**
 * Insights functionality - analyze practice sessions and show insights
 */

import { PracticeSession } from './practice.js';
import { showScreen } from './ui.js';

/**
 * Load and display insights
 */
export async function loadInsights() {
  const practiceSession = new PracticeSession();
  const history = practiceSession.getHistory();
  const container = document.getElementById('insights-container');

  if (!container) return;

  // Check if we have any sessions
  if (history.length === 0) {
    displayEmptyState(container);
    return;
  }

  // Generate insights from session data
  const insights = generateInsights(history);
  displayInsightsGrid(container, insights);
}

/**
 * Display empty state when no sessions exist
 */
function displayEmptyState(container) {
  container.innerHTML = `
    <div class="insights-empty">
      <h3>No Insights Available</h3>
      <p>Complete at least one practice session to start seeing personalized insights and trends.</p>
    </div>
  `;
}

/**
 * Generate insights from session history
 */
function generateInsights(history) {
  const insights = {
    driver: analyzeClub(history, 'driver'),
    iron: analyzeClub(history, 'iron'),
    wedge: analyzeClub(history, 'wedge'),
    putter: analyzeClub(history, 'putter')
  };

  return insights;
}

/**
 * Analyze sessions for a specific club
 */
function analyzeClub(history, clubMode) {
  const sessions = history.filter(s => s.club_mode === clubMode);

  if (sessions.length === 0) {
    return {
      totalSessions: 0,
      latestPercentage: 0,
      trend: 'neutral',
      hasData: false
    };
  }

  // Get latest session percentage
  const latestSession = sessions[0]; // History is sorted newest first
  const latestPercentage = latestSession.stats?.pure_percentage || 0;

  // Calculate trend (compare last 2-3 sessions)
  let trend = 'neutral';
  if (sessions.length >= 2) {
    const recent = sessions.slice(0, Math.min(3, sessions.length));
    const percentages = recent.map(s => s.stats?.pure_percentage || 0);

    // Simple trend: compare first and last
    if (percentages[0] > percentages[percentages.length - 1] + 5) {
      trend = 'up';
    } else if (percentages[0] < percentages[percentages.length - 1] - 5) {
      trend = 'down';
    }
  }

  return {
    totalSessions: sessions.length,
    latestPercentage: Math.round(latestPercentage),
    trend: trend,
    hasData: true
  };
}

/**
 * Display insights in a grid
 */
function displayInsightsGrid(container, insights) {
  const clubs = [
    { key: 'driver', icon: '🏌️', name: 'Driver' },
    { key: 'iron', icon: '🎯', name: 'Irons' },
    { key: 'wedge', icon: '📍', name: 'Wedges' },
    { key: 'putter', icon: '⛳', name: 'Putter' }
  ];

  const cardsHTML = clubs.map(club => {
    const data = insights[club.key];

    if (!data.hasData) {
      return `
        <div class="insight-card no-data">
          <div class="insight-card-header">
            <span class="insight-card-icon">${club.icon}</span>
            <span class="insight-card-title">${club.name}</span>
          </div>
          <div class="insight-stat">
            <div class="insight-stat-value">—</div>
            <div class="insight-stat-label">No Data</div>
          </div>
        </div>
      `;
    }

    const trendSymbol = data.trend === 'up' ? '↑' : data.trend === 'down' ? '↓' : '→';
    const trendText = data.trend === 'up' ? 'Improving' : data.trend === 'down' ? 'Declining' : 'Steady';

    return `
      <div class="insight-card">
        <div class="insight-card-header">
          <span class="insight-card-icon">${club.icon}</span>
          <span class="insight-card-title">${club.name}</span>
        </div>
        <div class="insight-stat">
          <div class="insight-stat-value">${data.latestPercentage}%</div>
          <div class="insight-stat-label">Latest Session</div>
        </div>
        <div class="insight-trend ${data.trend}">
          <span>${trendSymbol} ${trendText}</span>
        </div>
        <div style="margin-top: 0.5rem; font-size: 12px; color: var(--text-light);">
          ${data.totalSessions} session${data.totalSessions !== 1 ? 's' : ''}
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="insights-grid">
      ${cardsHTML}
    </div>
  `;
}

/**
 * Initialize insights screen event listeners
 */
export function initInsights() {
  // Insights button click
  const insightsBtn = document.getElementById('insights-btn');
  if (insightsBtn) {
    insightsBtn.addEventListener('click', () => {
      showScreen('insights-screen');
      loadInsights();
    });
  }

  // Back to history button
  const backHistoryBtn = document.getElementById('back-history-btn');
  if (backHistoryBtn) {
    backHistoryBtn.addEventListener('click', () => {
      showScreen('history-screen');
    });
  }
}
