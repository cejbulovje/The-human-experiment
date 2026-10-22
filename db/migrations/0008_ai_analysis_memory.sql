CREATE TABLE IF NOT EXISTS ai_analysis_memory (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  last_response_id INTEGER NOT NULL DEFAULT 0,
  summary TEXT NOT NULL DEFAULT '',
  response_count INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ai_analysis_lock (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  token TEXT NOT NULL,
  expires_at TEXT NOT NULL
);
