CREATE TABLE IF NOT EXISTS hypothetical_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  language TEXT NOT NULL CHECK (language IN ('en','ru','es','pt','zh','de','ja','fr','ar')),
  answers_json TEXT NOT NULL CHECK (json_valid(answers_json)),
  aggregate_consent INTEGER NOT NULL CHECK (aggregate_consent IN (0,1)),
  delete_token_hash TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_hypothetical_preferences_created_at
  ON hypothetical_preferences(created_at);
