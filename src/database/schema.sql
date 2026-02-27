-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    club_mode TEXT NOT NULL CHECK(club_mode IN ('driver', 'iron', 'wedge', 'putter')),
    iron_type TEXT,
    started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ended_at DATETIME,
    total_shots INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    notes TEXT
);

-- Shots table
CREATE TABLE IF NOT EXISTS shots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    shot_type TEXT NOT NULL,
    shot_category TEXT NOT NULL CHECK(shot_category IN ('ball_flight', 'mishit', 'putt', 'putt_speed', 'accuracy')),
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

-- Session stats table
CREATE TABLE IF NOT EXISTS session_stats (
    session_id INTEGER PRIMARY KEY,
    pure_count INTEGER DEFAULT 0,
    hook_count INTEGER DEFAULT 0,
    leak_left_count INTEGER DEFAULT 0,
    slight_right_count INTEGER DEFAULT 0,
    slice_count INTEGER DEFAULT 0,
    top_count INTEGER DEFAULT 0,
    chunk_count INTEGER DEFAULT 0,
    hosel_count INTEGER DEFAULT 0,
    make_count INTEGER DEFAULT 0,
    miss_count INTEGER DEFAULT 0,
    hammered_count INTEGER DEFAULT 0,
    speed_make_count INTEGER DEFAULT 0,
    gimme_count INTEGER DEFAULT 0,
    babied_count INTEGER DEFAULT 0,
    on_target_count INTEGER DEFAULT 0,
    left_count INTEGER DEFAULT 0,
    right_count INTEGER DEFAULT 0,
    short_count INTEGER DEFAULT 0,
    long_count INTEGER DEFAULT 0,
    pure_percentage REAL DEFAULT 0,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_shots_session_id ON shots(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_club_mode ON sessions(club_mode);
CREATE INDEX IF NOT EXISTS idx_sessions_is_active ON sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON sessions(started_at DESC);
