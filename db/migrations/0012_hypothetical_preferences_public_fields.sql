-- Extend the isolated hypothetical-preferences table without rewriting migration 0010.
-- Existing rows are preserved; legacy rows are treated as public to match the current API behavior.
ALTER TABLE hypothetical_preferences ADD COLUMN comment TEXT;
ALTER TABLE hypothetical_preferences ADD COLUMN public_consent INTEGER NOT NULL DEFAULT 1 CHECK (public_consent IN (0,1));
