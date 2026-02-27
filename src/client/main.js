/**
 * AllSwing Golf Tracker - Main Entry Point
 */

import { PracticeSession } from './practice.js';
import {
  showScreen,
  showModal,
  hideModal,
  updateSessionInfo,
  updateLiveStats,
  configurePracticeScreen,
  setUndoButtonState,
  flashButton,
  displaySummary
} from './ui.js';
import { initHistoryScreen, refreshHistory } from './history.js';

// Global state
const practiceSession = new PracticeSession();
let currentSessionStats = null;
let currentPuttingMode = null; // 'makemiss' or 'speed'
let currentPracticeMode = null; // 'contact' or 'accuracy'

/**
 * Initialize application
 */
function init() {
  setupHomeScreenListeners();
  setupIronModalListeners();
  setupPracticeScreenListeners();
  setupSummaryScreenListeners();

  // Check for active session on load
  checkForActiveSession();
}

/**
 * Setup home screen event listeners
 */
function setupHomeScreenListeners() {
  // Category selection buttons
  const categoryBtns = document.querySelectorAll('.category-btn');
  categoryBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const category = e.currentTarget.dataset.category;
      showScreen(`${category}-screen`);
    });
  });

  // Club selection buttons
  const clubBtns = document.querySelectorAll('.club-btn');
  clubBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const clubMode = e.currentTarget.dataset.club;
      const puttingMode = e.currentTarget.dataset.mode; // For putting modes
      const practiceMode = e.currentTarget.dataset.practiceMode; // 'contact' or 'accuracy'

      if (clubMode === 'iron') {
        // Store practice mode and show iron type selection modal
        currentPracticeMode = practiceMode;
        showModal('iron-modal');
      } else if (clubMode === 'putter') {
        // Store putting mode and start session
        currentPuttingMode = puttingMode;
        startSession(clubMode, null, puttingMode);
      } else {
        // Start session directly for driver/wedge
        currentPracticeMode = practiceMode;
        startSession(clubMode, null, null, practiceMode);
      }
    });
  });

  // History navigation button
  const historyNavBtn = document.querySelector('.history-nav-btn');
  if (historyNavBtn) {
    historyNavBtn.addEventListener('click', () => {
      showScreen('history-screen');
      initHistoryScreen();
    });
  }

  // Back buttons (generic handler for all back buttons)
  const backBtns = document.querySelectorAll('.back-btn');
  backBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetScreen = e.currentTarget.dataset.back;
      showScreen(targetScreen || 'home-screen');
    });
  });
}

/**
 * Setup iron type modal listeners
 */
function setupIronModalListeners() {
  const ironTypeBtns = document.querySelectorAll('.iron-type-btn');
  ironTypeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const ironType = e.target.dataset.iron;
      hideModal('iron-modal');
      startSession('iron', ironType, null, currentPracticeMode);
    });
  });

  const modalCancel = document.querySelector('.modal-cancel');
  if (modalCancel) {
    modalCancel.addEventListener('click', () => {
      hideModal('iron-modal');
      currentPracticeMode = null; // Reset
    });
  }
}

/**
 * Setup practice screen listeners
 */
function setupPracticeScreenListeners() {
  // Shot buttons - use event delegation
  const practiceContainer = document.querySelector('.practice-container');
  if (practiceContainer) {
    practiceContainer.addEventListener('click', async (e) => {
      const shotBtn = e.target.closest('.shot-btn');
      if (shotBtn && !shotBtn.disabled) {
        const shotType = shotBtn.dataset.shot;
        const shotCategory = shotBtn.dataset.category;

        if (shotType && shotCategory) {
          flashButton(shotBtn);
          await recordShot(shotType, shotCategory);
        }
      }
    });
  }

  // Undo button
  const undoBtn = document.getElementById('undo-btn');
  if (undoBtn) {
    undoBtn.addEventListener('click', async () => {
      await undoLastShot();
    });
  }

  // End session button
  const endSessionBtn = document.getElementById('end-session-btn');
  if (endSessionBtn) {
    endSessionBtn.addEventListener('click', () => {
      showSummaryScreen();
    });
  }
}

/**
 * Setup summary screen listeners
 */
function setupSummaryScreenListeners() {
  // Save session button
  const saveBtn = document.getElementById('save-session-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      await saveSession();
    });
  }

  // Discard button
  const discardBtn = document.getElementById('discard-session-btn');
  if (discardBtn) {
    discardBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to discard this session?')) {
        practiceSession.clearLocalStorage();
        showScreen('home-screen');
      }
    });
  }
}

/**
 * Start a new practice session
 */
async function startSession(clubMode, ironType = null, puttingMode = null, practiceMode = null) {
  try {
    await practiceSession.startSession(clubMode, ironType);

    // Store putting mode for display
    if (puttingMode) {
      currentPuttingMode = puttingMode;
    }

    // Store practice mode
    if (practiceMode) {
      currentPracticeMode = practiceMode;
    }

    // Configure practice screen
    configurePracticeScreen(clubMode, puttingMode, practiceMode);

    // Update UI with mode-specific display name
    let displayName = practiceSession.getClubDisplay();
    if (clubMode === 'putter' && puttingMode) {
      displayName = puttingMode === 'makemiss' ? 'Putter - Make/Miss' : 'Putter - Speed Control';
    } else if (practiceMode) {
      displayName = `${practiceSession.getClubDisplay()} - ${practiceMode === 'contact' ? 'Contact' : 'Accuracy'}`;
    }

    updateSessionInfo(displayName, 0);
    updateLiveStats(practiceSession.calculateLiveStats());
    setUndoButtonState(false);

    // Show practice screen
    showScreen('practice-screen');
  } catch (error) {
    console.error('Failed to start session:', error);
    alert('Failed to start practice session. Please try again.');
  }
}

/**
 * Record a shot
 */
async function recordShot(shotType, shotCategory) {
  try {
    const result = await practiceSession.recordShot(shotType, shotCategory);

    // Update UI
    const stats = practiceSession.calculateLiveStats();
    updateSessionInfo(practiceSession.getClubDisplay(), practiceSession.shots.length);
    updateLiveStats(stats);
    setUndoButtonState(true);
  } catch (error) {
    console.error('Failed to record shot:', error);
    alert('Failed to record shot. Please try again.');
  }
}

/**
 * Undo last shot
 */
async function undoLastShot() {
  try {
    await practiceSession.undoLastShot();

    // Update UI
    const stats = practiceSession.calculateLiveStats();
    updateSessionInfo(practiceSession.getClubDisplay(), practiceSession.shots.length);
    updateLiveStats(stats);
    setUndoButtonState(practiceSession.shots.length > 0);
  } catch (error) {
    console.error('Failed to undo shot:', error);
    alert('Failed to undo shot. Please try again.');
  }
}

/**
 * Show summary screen
 */
function showSummaryScreen() {
  if (practiceSession.shots.length === 0) {
    // No shots recorded - allow abandoning session
    if (confirm('No shots recorded. Abandon this session and return home?')) {
      practiceSession.clearLocalStorage();
      showScreen('home-screen');
    }
    return;
  }

  const stats = practiceSession.calculateLiveStats();
  currentSessionStats = {
    ...stats,
    total_shots: practiceSession.shots.length
  };

  displaySummary(currentSessionStats, practiceSession.clubMode, currentPracticeMode, currentPuttingMode);
  showScreen('summary-screen');
}

/**
 * Save session
 */
async function saveSession() {
  try {
    const notes = document.getElementById('session-notes')?.value || null;

    await practiceSession.endSession(notes);

    alert('Session saved successfully!');
    showScreen('home-screen');

    // Clear session notes
    const notesEl = document.getElementById('session-notes');
    if (notesEl) {
      notesEl.value = '';
    }
  } catch (error) {
    console.error('Failed to save session:', error);
    alert('Failed to save session. Please try again.');
  }
}

/**
 * Check for active session on page load
 */
async function checkForActiveSession() {
  // Check localStorage first
  if (practiceSession.loadFromLocalStorage()) {
    if (confirm('You have an active practice session. Would you like to resume?')) {
      // Resume session
      configurePracticeScreen(practiceSession.clubMode);
      updateSessionInfo(practiceSession.getClubDisplay(), practiceSession.shots.length);
      updateLiveStats(practiceSession.calculateLiveStats());
      setUndoButtonState(practiceSession.shots.length > 0);
      showScreen('practice-screen');
    } else {
      // Clear localStorage
      practiceSession.clearLocalStorage();
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
