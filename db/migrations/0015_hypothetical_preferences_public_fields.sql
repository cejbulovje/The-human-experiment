-- Add explicit public-display consent and optional public-facing text to personal preferences.
-- Existing records remain unpublished because the new consent defaults to 0.
ALTER TABLE hypothetical_preferences
  ADD COLUMN pseudonym TEXT CHECK (pseudonym IS NULL OR length(pseudonym) <= 60);

ALTER TABLE hypothetical_preferences
  ADD COLUMN comment TEXT CHECK (comment IS NULL OR length(comment) <= 10000);

ALTER TABLE hypothetical_preferences
  ADD COLUMN public_consent INTEGER NOT NULL DEFAULT 0 CHECK (public_consent IN (0,1));

CREATE INDEX IF NOT EXISTS idx_hypothetical_preferences_public_created
  ON hypothetical_preferences(public_consent, created_at);
