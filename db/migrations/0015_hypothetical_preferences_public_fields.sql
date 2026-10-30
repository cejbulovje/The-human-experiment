-- Add the optional pseudonym field and public listing index.
-- comment and public_consent are introduced by migration 0012 and must not be added again.
ALTER TABLE hypothetical_preferences
  ADD COLUMN pseudonym TEXT CHECK (pseudonym IS NULL OR length(pseudonym) <= 60);

CREATE INDEX IF NOT EXISTS idx_hypothetical_preferences_public_created
  ON hypothetical_preferences(public_consent, created_at);
