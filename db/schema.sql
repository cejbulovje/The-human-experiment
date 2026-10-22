CREATE TABLE IF NOT EXISTS responses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  language TEXT NOT NULL CHECK (language IN ('en', 'ru', 'es', 'pt', 'zh', 'de', 'ja', 'fr', 'ar')),
  free_answer TEXT NOT NULL CHECK (length(free_answer) BETWEEN 1 AND 5000),
  q2 INTEGER NOT NULL CHECK (q2 BETWEEN 0 AND 6),
  q3 INTEGER NOT NULL CHECK (q3 BETWEEN 0 AND 4),
  q4 INTEGER NOT NULL CHECK (q4 BETWEEN 0 AND 6),
  q2_other TEXT CHECK (q2_other IS NULL OR length(q2_other) <= 500),
  q3_other TEXT CHECK (q3_other IS NULL OR length(q3_other) <= 500),
  q4_other TEXT CHECK (q4_other IS NULL OR length(q4_other) <= 500),
  gender INTEGER NULL CHECK (gender BETWEEN 0 AND 3),
  orientation INTEGER NULL CHECK (orientation BETWEEN 0 AND 4),
  signature TEXT CHECK (signature IS NULL OR length(signature) <= 60),
  created_at TEXT NOT NULL,
  public_id TEXT,
  participant_id TEXT,
  is_public INTEGER NOT NULL DEFAULT 0,
  topic TEXT NOT NULL DEFAULT 'other'
);
CREATE INDEX IF NOT EXISTS idx_responses_created_at ON responses(created_at);
CREATE INDEX IF NOT EXISTS idx_responses_language ON responses(language);
CREATE TABLE IF NOT EXISTS rate_limits (
  ip_hash TEXT PRIMARY KEY,
  window_start INTEGER NOT NULL,
  count INTEGER NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_responses_public_id ON responses(public_id);
CREATE INDEX IF NOT EXISTS idx_responses_participant_public ON responses(participant_id, is_public, created_at);
CREATE INDEX IF NOT EXISTS idx_responses_public_created ON responses(is_public, created_at);
CREATE TABLE IF NOT EXISTS response_reactions (response_id INTEGER NOT NULL REFERENCES responses(id) ON DELETE CASCADE, reaction TEXT NOT NULL CHECK (reaction IN ('interesting')), voter_hash TEXT NOT NULL, created_at TEXT NOT NULL, PRIMARY KEY (response_id, reaction, voter_hash));
CREATE INDEX IF NOT EXISTS idx_response_reactions_response ON response_reactions(response_id, reaction);

CREATE TABLE IF NOT EXISTS topic_suggestions (id INTEGER PRIMARY KEY AUTOINCREMENT, response_id INTEGER NOT NULL REFERENCES responses(id) ON DELETE CASCADE, suggested_topic TEXT NOT NULL CHECK (suggested_topic IN ('character','appearance','freedom','life','relationships','other')), voter_hash TEXT NOT NULL, created_at TEXT NOT NULL, UNIQUE(response_id, voter_hash));

CREATE TABLE IF NOT EXISTS ai_daily_visitors (
  day TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (day, ip_hash)
);
CREATE TABLE IF NOT EXISTS ai_daily_usage (
  day TEXT PRIMARY KEY,
  requests INTEGER NOT NULL DEFAULT 0 CHECK (requests BETWEEN 0 AND 100)
);
