-- Existing responses have no explicit permission for analysis of written answers.
ALTER TABLE responses ADD COLUMN ai_text_consent INTEGER NOT NULL DEFAULT 0 CHECK (ai_text_consent IN (0,1));
ALTER TABLE hypothetical_preferences ADD COLUMN ai_text_consent INTEGER NOT NULL DEFAULT 0 CHECK (ai_text_consent IN (0,1));
