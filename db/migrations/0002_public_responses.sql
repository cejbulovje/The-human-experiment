ALTER TABLE responses ADD COLUMN public_id TEXT;
ALTER TABLE responses ADD COLUMN is_public INTEGER NOT NULL DEFAULT 0;
ALTER TABLE responses ADD COLUMN topic TEXT NOT NULL DEFAULT 'other';
UPDATE responses SET public_id = 'legacy-' || id WHERE public_id IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_responses_public_id ON responses(public_id);
CREATE INDEX IF NOT EXISTS idx_responses_public_created ON responses(is_public, created_at);
CREATE TABLE IF NOT EXISTS response_reactions (
  response_id INTEGER NOT NULL REFERENCES responses(id) ON DELETE CASCADE,
  reaction TEXT NOT NULL CHECK (reaction IN ('interesting')),
  voter_hash TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (response_id, reaction, voter_hash)
);
CREATE INDEX IF NOT EXISTS idx_response_reactions_response ON response_reactions(response_id, reaction);

CREATE TABLE IF NOT EXISTS topic_suggestions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  response_id INTEGER NOT NULL REFERENCES responses(id) ON DELETE CASCADE,
  suggested_topic TEXT NOT NULL CHECK (suggested_topic IN ('character','appearance','freedom','life','relationships','other')),
  voter_hash TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(response_id, voter_hash)
);
