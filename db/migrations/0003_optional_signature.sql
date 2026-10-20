ALTER TABLE responses ADD COLUMN signature TEXT CHECK (signature IS NULL OR length(signature) <= 60);
