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
