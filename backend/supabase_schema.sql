-- AdaptEd Supabase Database Schema
-- Run this SQL in your Supabase dashboard SQL editor

-- Lessons cache table
CREATE TABLE IF NOT EXISTS lessons (
    id          TEXT PRIMARY KEY,
    goal_hash   TEXT UNIQUE NOT NULL,
    goal_raw    TEXT NOT NULL,
    content     JSONB NOT NULL,
    notes       TEXT,
    sources     JSONB,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    hit_count   INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_lessons_goal_hash ON lessons(goal_hash);

-- User sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    last_seen   TIMESTAMPTZ DEFAULT NOW()
);

-- Progress tracking table
CREATE TABLE IF NOT EXISTS progress (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id   UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    lesson_id    TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    viewed_nodes JSONB NOT NULL DEFAULT '[]',
    hint_counts  JSONB NOT NULL DEFAULT '{}',
    updated_at   TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(session_id, lesson_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_progress_session_id ON progress(session_id);
CREATE INDEX IF NOT EXISTS idx_progress_lesson_id ON progress(lesson_id);

-- Update last_seen on sessions table when progress is updated
CREATE OR REPLACE FUNCTION update_session_last_seen()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE sessions
    SET last_seen = NOW()
    WHERE id = NEW.session_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_session_last_seen
AFTER INSERT OR UPDATE ON progress
FOR EACH ROW
EXECUTE FUNCTION update_session_last_seen();
