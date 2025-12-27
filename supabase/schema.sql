-- Health Challenge App Database Schema for Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Challenges table
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  duration_days INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('upcoming', 'active', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rules table
CREATE TABLE rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('boolean', 'numeric', 'text')),
  target_value TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Participants table
CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily Progress table
CREATE TABLE daily_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  rule_id UUID NOT NULL REFERENCES rules(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  value TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(participant_id, rule_id, date)
);

-- Indexes for better query performance
CREATE INDEX idx_rules_challenge_id ON rules(challenge_id);
CREATE INDEX idx_participants_challenge_id ON participants(challenge_id);
CREATE INDEX idx_daily_progress_participant_id ON daily_progress(participant_id);
CREATE INDEX idx_daily_progress_rule_id ON daily_progress(rule_id);
CREATE INDEX idx_daily_progress_date ON daily_progress(date);
CREATE INDEX idx_challenges_status ON challenges(status);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update updated_at
CREATE TRIGGER update_challenges_updated_at
  BEFORE UPDATE ON challenges
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_progress_updated_at
  BEFORE UPDATE ON daily_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
-- For now, we'll keep it simple since we're using shared password auth
-- You can enable RLS later if needed

ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_progress ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (we'll handle auth in the app layer)
CREATE POLICY "Allow all operations on challenges" ON challenges FOR ALL USING (true);
CREATE POLICY "Allow all operations on rules" ON rules FOR ALL USING (true);
CREATE POLICY "Allow all operations on participants" ON participants FOR ALL USING (true);
CREATE POLICY "Allow all operations on daily_progress" ON daily_progress FOR ALL USING (true);
