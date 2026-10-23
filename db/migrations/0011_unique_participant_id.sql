-- Enforce at most one response per non-null participant ID.
-- NULL IDs remain allowed for legacy or unlinked submissions.
CREATE UNIQUE INDEX IF NOT EXISTS idx_responses_participant_id_unique
  ON responses(participant_id)
  WHERE participant_id IS NOT NULL;
