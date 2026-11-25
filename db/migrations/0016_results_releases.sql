CREATE TABLE IF NOT EXISTS results_releases (
  stream TEXT NOT NULL CHECK(stream IN ('collective','hypothetical')),
  threshold INTEGER NOT NULL CHECK(threshold>=100),
  total INTEGER NOT NULL CHECK(total>=threshold),
  upper_id INTEGER NOT NULL CHECK(upper_id>=0),
  published_at TEXT NOT NULL,
  counts_json TEXT NOT NULL CHECK(json_valid(counts_json)),
  PRIMARY KEY(stream,threshold)
);
