/**
 * UI functions for DOM manipulation and screen management
 */

/**
 * Show a specific screen and hide others
 */
export function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });

  const targetScreen = document.getElementById(screenId);
  if (targetScreen) {
    targetScreen.classList.add('active');
  }
}

/**
 * Show/hide modal
 */
export function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
  }
}

export function hideModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
  }
}

/**
 * Update practice session info header
 */
export function updateSessionInfo(clubDisplay, shotCount) {
  const clubDisplayEl = document.getElementById('club-display');
  const shotCounterEl = document.getElementById('shot-counter');

  if (clubDisplayEl) {
    clubDisplayEl.textContent = clubDisplay;
  }

  if (shotCounterEl) {
    shotCounterEl.textContent = shotCount === 1 ? '1 shot' : `${shotCount} shots`;
  }
}

/**
 * Update live stats display
 */
export function updateLiveStats(stats) {
  // Update pure percentage
  const purePercentageEl = document.getElementById('pure-percentage');
  if (purePercentageEl) {
    purePercentageEl.textContent = `${stats.pure_percentage}%`;
  }

  // Update recent shots
  const recentShotsEl = document.getElementById('recent-shots-list');
  if (recentShotsEl) {
    if (stats.recent_shots.length === 0) {
      recentShotsEl.innerHTML = '<span class="empty-state">No shots yet</span>';
    } else {
      recentShotsEl.innerHTML = stats.recent_shots.map(shot =>
        `<span class="recent-shot-badge ${shot.type}">${shot.type}</span>`
      ).join('');
    }
  }
}

/**
 * Configure practice screen for club mode
 */
export function configurePracticeScreen(clubMode, puttingMode = null, practiceMode = null) {
  const contactSection = document.getElementById('contact-section');
  const accuracySection = document.getElementById('accuracy-section');
  const putterMakeMissSection = document.getElementById('putter-makemiss-section');
  const putterSpeedSection = document.getElementById('putter-speed-section');
  const statLabel = document.getElementById('stat-label');

  // Update stat label based on mode
  if (clubMode === 'putter') {
    if (puttingMode === 'speed') {
      statLabel.textContent = 'Make/Gimme %';
    } else {
      statLabel.textContent = 'Make %';
    }
  } else if (practiceMode === 'accuracy') {
    statLabel.textContent = 'On-Target %';
  } else {
    statLabel.textContent = 'Pure %';
  }

  if (clubMode === 'putter') {
    // Hide contact and accuracy modes
    contactSection.classList.add('hidden');
    accuracySection.classList.add('hidden');

    // Show appropriate putter mode
    if (puttingMode === 'speed') {
      putterMakeMissSection.classList.add('hidden');
      putterSpeedSection.classList.remove('hidden');
    } else {
      // Default to makemiss mode
      putterMakeMissSection.classList.remove('hidden');
      putterSpeedSection.classList.add('hidden');
    }
  } else {
    // Hide putter modes
    putterMakeMissSection.classList.add('hidden');
    putterSpeedSection.classList.add('hidden');

    // Show appropriate practice mode
    if (practiceMode === 'accuracy') {
      contactSection.classList.add('hidden');
      accuracySection.classList.remove('hidden');
    } else {
      // Default to contact mode
      contactSection.classList.remove('hidden');
      accuracySection.classList.add('hidden');
    }
  }
}

/**
 * Enable/disable undo button
 */
export function setUndoButtonState(enabled) {
  const undoBtn = document.getElementById('undo-btn');
  if (undoBtn) {
    undoBtn.disabled = !enabled;
  }
}

/**
 * Flash animation for shot button
 */
export function flashButton(button) {
  button.classList.add('flash');
  setTimeout(() => {
    button.classList.remove('flash');
  }, 300);
}

/**
 * Display session summary
 */
export function displaySummary(stats, clubMode, practiceMode = null, puttingMode = null) {
  // Update total shots
  const summaryTotalEl = document.getElementById('summary-total');
  if (summaryTotalEl) {
    summaryTotalEl.textContent = stats.total_shots;
  }

  // Update pure percentage
  const summaryPurePctEl = document.getElementById('summary-pure-pct');
  if (summaryPurePctEl) {
    if (clubMode === 'putter') {
      if (puttingMode === 'speed') {
        // Speed mode - show gimme + make as goal achievement
        const goalShots = (stats.speed_make_count || 0) + (stats.gimme_count || 0);
        const totalPutts = stats.total_shots || 1;
        const goalPct = Math.round((goalShots / totalPutts) * 100);
        summaryPurePctEl.textContent = `${goalShots}/${totalPutts}`;
        summaryPurePctEl.parentElement.querySelector('span:last-child').textContent = `Goal (${goalPct}%)`;
      } else {
        // Make/miss mode
        const makeCount = stats.make_count || 0;
        const totalPutts = makeCount + (stats.miss_count || 0);
        const makePct = totalPutts > 0 ? Math.round((makeCount / totalPutts) * 100) : 0;
        summaryPurePctEl.textContent = `${makePct}%`;
        summaryPurePctEl.parentElement.querySelector('span:last-child').textContent = 'Make %';
      }
    } else if (practiceMode === 'accuracy') {
      // Accuracy mode - show on-target percentage
      summaryPurePctEl.textContent = `${stats.pure_percentage || 0}%`;
      summaryPurePctEl.parentElement.querySelector('span:last-child').textContent = 'On Target';
    } else {
      // Contact mode - show pure percentage
      summaryPurePctEl.textContent = `${stats.pure_percentage || 0}%`;
      summaryPurePctEl.parentElement.querySelector('span:last-child').textContent = 'Pure';
    }
  }

  // Update stats breakdown
  const summaryStatsEl = document.getElementById('summary-stats');
  if (summaryStatsEl) {
    summaryStatsEl.innerHTML = generateSummaryStatsHTML(stats, clubMode, practiceMode, puttingMode);
  }
}

/**
 * Generate summary stats HTML
 */
function generateSummaryStatsHTML(stats, clubMode, practiceMode = null, puttingMode = null) {
  // Putter modes
  if (clubMode === 'putter') {
    if (puttingMode === 'speed') {
      return `
        <div class="stat-group">
          <h4>Speed Control</h4>
          ${createStatBar('Make', stats.speed_make_count || 0, stats.total_shots, '#22c55e')}
          ${createStatBar('Gimme Range', stats.gimme_count || 0, stats.total_shots, '#3b82f6')}
          ${createStatBar('Babied It', stats.babied_count || 0, stats.total_shots, '#f97316')}
          ${createStatBar('Hammered It', stats.hammered_count || 0, stats.total_shots, '#ef4444')}
        </div>
      `;
    } else {
      // Make/Miss mode
      return `
        <div class="stat-group">
          <h4>Putting</h4>
          ${createStatBar('Make', stats.make_count || 0, stats.total_shots, '#22c55e')}
          ${createStatBar('Miss', stats.miss_count || 0, stats.total_shots, '#ef4444')}
        </div>
      `;
    }
  }

  // Accuracy mode
  if (practiceMode === 'accuracy') {
    const accuracyTotal = (stats.on_target_count || 0) + (stats.left_count || 0) +
                          (stats.right_count || 0) + (stats.short_count || 0) + (stats.long_count || 0);

    // Accuracy mode uses generic mishit count
    const mishitCount = stats.mishit_count || 0;
    const accuracyMishitsHTML = mishitCount > 0 ? `
      <div class="stat-group">
        <h4>Mishits</h4>
        ${createStatBar('Mishit', mishitCount, mishitCount, '#ef4444')}
      </div>
    ` : '';

    return `
      <div class="stat-group">
        <h4>Target Accuracy</h4>
        ${createStatBar('On Target', stats.on_target_count || 0, accuracyTotal, '#22c55e')}
        ${createStatBar('Left', stats.left_count || 0, accuracyTotal, '#3b82f6')}
        ${createStatBar('Right', stats.right_count || 0, accuracyTotal, '#3b82f6')}
        ${createStatBar('Short', stats.short_count || 0, accuracyTotal, '#f97316')}
        ${createStatBar('Long', stats.long_count || 0, accuracyTotal, '#f97316')}
      </div>
      ${accuracyMishitsHTML}
    `;
  }

  // Contact mode mishits section (three separate types)
  const mishitsTotal = (stats.top_count || 0) + (stats.chunk_count || 0) + (stats.hosel_count || 0);
  const mishitsHTML = mishitsTotal > 0 ? `
    <div class="stat-group">
      <h4>Mishits</h4>
      ${createStatBar('Top', stats.top_count || 0, mishitsTotal, '#ef4444')}
      ${createStatBar('Chunk', stats.chunk_count || 0, mishitsTotal, '#ef4444')}
      ${createStatBar('Hosel', stats.hosel_count || 0, mishitsTotal, '#ef4444')}
    </div>
  ` : '';

  // Contact mode (default)
  const ballFlightTotal = (stats.hook_count || 0) + (stats.leak_left_count || 0) +
                          (stats.pure_count || 0) + (stats.slight_right_count || 0) +
                          (stats.slice_count || 0);

  return `
    <div class="stat-group">
      <h4>Ball Flight</h4>
      ${createStatBar('Hook', stats.hook_count || 0, ballFlightTotal, '#ef4444')}
      ${createStatBar('Leak Left', stats.leak_left_count || 0, ballFlightTotal, '#f97316')}
      ${createStatBar('Pure', stats.pure_count || 0, ballFlightTotal, '#22c55e')}
      ${createStatBar('Slight Right', stats.slight_right_count || 0, ballFlightTotal, '#3b82f6')}
      ${createStatBar('Slice', stats.slice_count || 0, ballFlightTotal, '#a855f7')}
    </div>
    ${mishitsHTML}
  `;
}

/**
 * Create a stat bar HTML
 */
function createStatBar(label, count, total, color) {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  return `
    <div class="stat-bar">
      <span class="stat-bar-label">${label}</span>
      <div class="stat-bar-container">
        <div class="stat-bar-fill" style="width: ${percentage}%; background: ${color};"></div>
      </div>
      <span class="stat-bar-value">${count}</span>
    </div>
  `;
}

/**
 * Display history list
 */
export function displayHistory(sessions) {
  const historyListEl = document.getElementById('history-list');

  if (!historyListEl) return;

  if (sessions.length === 0) {
    historyListEl.innerHTML = '<div class="empty-state">No practice sessions yet</div>';
    return;
  }

  historyListEl.innerHTML = sessions.map(session => {
    const date = new Date(session.started_at);
    const dateStr = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    const clubDisplay = session.club_mode === 'iron' && session.iron_type
      ? `${session.iron_type.toUpperCase()}`
      : session.club_mode.charAt(0).toUpperCase() + session.club_mode.slice(1);

    const purePct = session.stats?.pure_percentage !== undefined ? session.stats.pure_percentage : 0;

    return `
      <div class="history-item" data-session-id="${session.id}">
        <div class="history-item-header">
          <span class="history-club">${clubDisplay}</span>
          <span class="history-date">${dateStr}</span>
        </div>
        <div class="history-stats">
          <div class="history-stat">
            <span class="history-stat-value">${session.total_shots}</span>
            <span class="history-stat-label">Shots</span>
          </div>
          <div class="history-stat">
            <span class="history-stat-value">${purePct}%</span>
            <span class="history-stat-label">Pure</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Display session detail modal
 */
export function displaySessionDetail(session) {
  const contentEl = document.getElementById('session-detail-content');
  if (!contentEl) return;

  const date = new Date(session.started_at);
  const dateStr = date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });

  const clubDisplay = session.club_mode === 'iron' && session.iron_type
    ? `${session.iron_type.toUpperCase()}`
    : session.club_mode.charAt(0).toUpperCase() + session.club_mode.slice(1);

  contentEl.innerHTML = `
    <h2>${clubDisplay} Session</h2>
    <p class="session-date">${dateStr}</p>
    <div class="summary-highlight">
      <div class="total-shots">
        <span>${session.total_shots}</span>
        <span>Total Shots</span>
      </div>
      <div class="pure-stat">
        <span>${session.stats?.pure_percentage || 0}%</span>
        <span>Pure</span>
      </div>
    </div>
    ${session.stats ? `
      <div class="summary-stats">
        ${generateSummaryStatsHTML(session.stats, session.club_mode)}
      </div>
    ` : ''}
    ${session.notes ? `
      <div class="session-notes">
        <h4>Notes</h4>
        <p>${session.notes}</p>
      </div>
    ` : ''}
  `;
}
