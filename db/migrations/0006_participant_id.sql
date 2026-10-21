-- Add a pseudonymous participant identifier to group future public answers.
-- Existing responses remain unlinked (NULL) because their authors cannot be reliably inferred.
ALTER TABLE responses ADD COLUMN participant_id TEXT;
CREATE INDEX IF NOT EXISTS idx_responses_participant_public ON responses(participant_id, is_public, created_at);
