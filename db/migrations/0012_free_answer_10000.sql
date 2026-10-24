-- Raise the main survey free-answer limit without discarding existing responses.
-- Foreign-key enforcement is disabled only while the responses table is rebuilt;
-- dependent tables keep their references to the final table name, responses.
PRAGMA foreign_keys = OFF;
BEGIN TRANSACTION;

CREATE TABLE responses_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  language TEXT NOT NULL CHECK (language IN ('en', 'ru', 'es', 'pt', 'zh', 'de', 'ja', 'fr', 'ar')),
  free_answer TEXT NOT NULL CHECK (length(free_answer) BETWEEN 1 AND 10000),
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

INSERT INTO responses_new (
  id, language, free_answer, q2, q3, q4, q2_other, q3_other, q4_other,
  gender, orientation, signature, created_at, public_id, participant_id, is_public, topic
)
SELECT
  id, language, free_answer, q2, q3, q4, q2_other, q3_other, q4_other,
  gender, orientation, signature, created_at, public_id, participant_id, is_public, topic
FROM responses;

DROP TABLE responses;
ALTER TABLE responses_new RENAME TO responses;

CREATE INDEX IF NOT EXISTS idx_responses_created_at ON responses(created_at);
CREATE INDEX IF NOT EXISTS idx_responses_language ON responses(language);
CREATE UNIQUE INDEX IF NOT EXISTS idx_responses_public_id ON responses(public_id);
CREATE INDEX IF NOT EXISTS idx_responses_participant_public ON responses(participant_id, is_public, created_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_responses_participant_id_unique ON responses(participant_id) WHERE participant_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_responses_public_created ON responses(is_public, created_at);

COMMIT;
PRAGMA foreign_keys = ON;
