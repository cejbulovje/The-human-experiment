-- Local-safe schema migration: rebuild responses so all nine language codes are accepted.
-- Existing response IDs and values are copied before the old table is replaced.
BEGIN TRANSACTION;

CREATE TABLE responses_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  language TEXT NOT NULL CHECK (language IN ('en', 'ru', 'es', 'pt', 'zh', 'de', 'ja', 'fr', 'ar')),
  free_answer TEXT NOT NULL CHECK (length(free_answer) BETWEEN 1 AND 5000),
  q2 INTEGER NOT NULL CHECK (q2 BETWEEN 0 AND 6),
  q3 INTEGER NOT NULL CHECK (q3 BETWEEN 0 AND 4),
  q4 INTEGER NOT NULL CHECK (q4 BETWEEN 0 AND 6),
  gender INTEGER NULL CHECK (gender BETWEEN 0 AND 3),
  orientation INTEGER NULL CHECK (orientation BETWEEN 0 AND 4),
  created_at TEXT NOT NULL
);

INSERT INTO responses_new (id, language, free_answer, q2, q3, q4, gender, orientation, created_at)
SELECT id, language, free_answer, q2, q3, q4, gender, orientation, created_at
FROM responses;

DROP TABLE responses;
ALTER TABLE responses_new RENAME TO responses;

CREATE INDEX IF NOT EXISTS idx_responses_created_at ON responses(created_at);
CREATE INDEX IF NOT EXISTS idx_responses_language ON responses(language);

COMMIT;
