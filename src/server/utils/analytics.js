/**
 * Calculate session statistics from shots
 * @param {Array} shots - Array of shot objects
 * @returns {Object} Statistics object
 */
export function calculateSessionStats(shots) {
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
    pure_percentage: 0
  };

  shots.forEach(shot => {
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

  // Calculate "good shots" percentage
  // Includes: pure (contact), on_target (accuracy), make+gimme (putting speed)
  const totalShots = shots.length;
  if (totalShots > 0) {
    const goodShots = stats.pure_count + stats.on_target_count + stats.speed_make_count + stats.gimme_count;
    stats.pure_percentage = Math.round((goodShots / totalShots) * 100 * 10) / 10;
  }

  return stats;
}

/**
 * Get live stats for current session (last N shots, current stats)
 * @param {Array} shots - Array of shot objects
 * @param {Number} lastN - Number of recent shots to return
 * @returns {Object} Live stats object
 */
export function getLiveStats(shots, lastN = 5) {
  const stats = calculateSessionStats(shots);
  const recentShots = shots.slice(-lastN).reverse();

  return {
    ...stats,
    total_shots: shots.length,
    recent_shots: recentShots.map(s => ({
      type: s.shot_type,
      category: s.shot_category,
      timestamp: s.timestamp
    }))
  };
}

/**
 * Format stats for summary display
 * @param {Object} stats - Stats object from session_stats table
 * @param {String} clubMode - Club mode (driver/iron/wedge/putter)
 * @returns {Object} Formatted stats with grouped data
 */
export function formatSummaryStats(stats, clubMode) {
  const isPutter = clubMode === 'putter';

  if (isPutter) {
    return {
      putting: {
        make_count: stats.make_count,
        miss_count: stats.miss_count,
        make_percentage: stats.make_count > 0
          ? Math.round((stats.make_count / (stats.make_count + stats.miss_count)) * 100)
          : 0
      }
    };
  }

  return {
    ball_flight: {
      hook_count: stats.hook_count,
      draw_count: stats.draw_count,
      pure_count: stats.pure_count,
      fade_count: stats.fade_count,
      slice_count: stats.slice_count
    },
    mishits: {
      top_count: stats.top_count,
      chunk_count: stats.chunk_count,
      hosel_count: stats.hosel_count
    },
    pure_percentage: stats.pure_percentage
  };
}
