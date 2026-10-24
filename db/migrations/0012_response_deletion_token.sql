ALTER TABLE responses ADD COLUMN delete_token_hash TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_responses_delete_token_hash
  ON responses(delete_token_hash) WHERE delete_token_hash IS NOT NULL;
