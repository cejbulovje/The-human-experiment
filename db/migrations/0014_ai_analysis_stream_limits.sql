-- Keep each connection's daily AI allowance separate for collective and personal-preference analysis.
-- Existing usage is preserved as collective usage so this migration does not grant a second
-- collective request to anyone who has already used today's allowance.
ALTER TABLE ai_daily_visitors RENAME TO ai_daily_visitors_legacy;

CREATE TABLE ai_daily_visitors (
  day TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  stream TEXT NOT NULL DEFAULT 'collective' CHECK (stream IN ('collective','hypothetical')),
  created_at TEXT NOT NULL,
  PRIMARY KEY (day, ip_hash, stream)
);

INSERT INTO ai_daily_visitors (day, ip_hash, stream, created_at)
SELECT day, ip_hash, 'collective', created_at
FROM ai_daily_visitors_legacy;

DROP TABLE ai_daily_visitors_legacy;
