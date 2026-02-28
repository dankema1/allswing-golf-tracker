/**
 * History screen logic - reads from localStorage
 */

import { displayHistory, displaySessionDetail, showModal, hideModal } from './ui.js';
import { PracticeSession } from './practice.js';

let currentFilter = 'all';

/**
 * Initialize history screen
 */
export async function initHistoryScreen() {
  await loadHistory(currentFilter);
  setupHistoryListeners();
}

/**
 * Load history with optional filter from localStorage
 */
async function loadHistory(clubMode = 'all') {
  try {
    // Get sessions from localStorage
    const practiceSession = new PracticeSession();
    let sessions = practiceSession.getHistory();

    // Filter by club mode if not 'all'
    if (clubMode !== 'all') {
      sessions = sessions.filter(s => s.club_mode === clubMode);
    }

    // Limit to 50 most recent
    sessions = sessions.slice(0, 50);

    displayHistory(sessions);
  } catch (error) {
    console.error('Failed to load history:', error);
    const historyListEl = document.getElementById('history-list');
    if (historyListEl) {
      historyListEl.innerHTML = '<div class="empty-state">Failed to load history</div>';
    }
  }
}

/**
 * Setup history screen event listeners
 */
function setupHistoryListeners() {
  // Filter buttons
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const filter = e.target.dataset.filter;
      currentFilter = filter;

      // Update active state
      filterBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');

      // Load filtered history
      await loadHistory(filter);
    });
  });

  // Clear history button
  const clearHistoryBtn = document.getElementById('clear-history-btn');
  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', async () => {
      if (confirm('Are you sure you want to clear all practice history? This cannot be undone.')) {
        const practiceSession = new PracticeSession();
        localStorage.removeItem('sessionHistory');
        await loadHistory(currentFilter);
        alert('History cleared successfully!');
      }
    });
  }

  // History item clicks - use event delegation
  const historyList = document.getElementById('history-list');
  if (historyList) {
    historyList.addEventListener('click', async (e) => {
      const historyItem = e.target.closest('.history-item');
      if (historyItem) {
        const sessionId = historyItem.dataset.sessionId;
        await showSessionDetail(sessionId);
      }
    });
  }

  // Modal close
  const modalClose = document.querySelector('#session-detail-modal .modal-close');
  if (modalClose) {
    modalClose.addEventListener('click', () => {
      hideModal('session-detail-modal');
    });
  }

  // Click outside modal to close
  const modal = document.getElementById('session-detail-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        hideModal('session-detail-modal');
      }
    });
  }
}

/**
 * Show session detail modal
 */
async function showSessionDetail(sessionId) {
  try {
    // Get session from localStorage
    const practiceSession = new PracticeSession();
    const sessions = practiceSession.getHistory();
    const session = sessions.find(s => s.id === sessionId);

    if (!session) {
      throw new Error('Session not found');
    }

    displaySessionDetail(session);
    showModal('session-detail-modal');
  } catch (error) {
    console.error('Failed to load session detail:', error);
    alert('Failed to load session details');
  }
}

/**
 * Refresh history (called after new session is saved)
 */
export async function refreshHistory() {
  await loadHistory(currentFilter);
}
