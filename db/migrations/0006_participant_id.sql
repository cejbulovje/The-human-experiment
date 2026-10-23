-- Add an optional pseudonymous participant identifier without changing existing responses.
ALTER TABLE responses ADD COLUMN participant_id TEXT;
CREATE INDEX IF NOT EXISTS idx_responses_participant_public ON responses(participant_id, created_at);
