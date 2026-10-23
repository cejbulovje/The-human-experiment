-- Enforce at most one response per non-null participant ID.
-- SQLite permits multiple NULL values, so anonymous and legacy responses remain allowed.
CREATE UNIQUE INDEX IF NOT EXISTS idx_responses_participant_id_unique
  ON responses(participant_id)
  WHERE participant_id IS NOT NULL;
