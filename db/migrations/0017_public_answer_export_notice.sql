-- New answers only: previous submissions retain version zero.
ALTER TABLE responses ADD COLUMN export_notice_version INTEGER NOT NULL DEFAULT 0 CHECK (export_notice_version IN (0,1));
ALTER TABLE hypothetical_preferences ADD COLUMN export_notice_version INTEGER NOT NULL DEFAULT 0 CHECK (export_notice_version IN (0,1));
