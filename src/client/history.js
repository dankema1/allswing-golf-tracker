/**
 * History screen logic
 */

import { sessionsAPI } from './api.js';
import { displayHistory, displaySessionDetail, showModal, hideModal } from './ui.js';

let currentFilter = 'all';

/**
 * Initialize history screen
 */
export async function initHistoryScreen() {
  await loadHistory(currentFilter);
  setupHistoryListeners();
}

/**
 * Load history with optional filter
 */
async function loadHistory(clubMode = 'all') {
  try {
    const sessions = await sessionsAPI.getHistory(50, clubMode === 'all' ? null : clubMode);
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
    const session = await sessionsAPI.getById(sessionId);
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
