import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const migration = readFileSync(
  new URL('../db/migrations/0005_legacy_production_schema.sql', import.meta.url),
  'utf8'
);

test('legacy Production migration preserves data and creates the current schema', () => {
  const python = String.raw`
import json, sqlite3, sys
payload = json.load(sys.stdin)
db = sqlite3.connect(':memory:')
db.execute('PRAGMA foreign_keys = ON')

# Reproduce the original Production schema.
db.executescript("""
CREATE TABLE responses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  language TEXT NOT NULL CHECK (language IN ('en','ru')),
  free_answer TEXT NOT NULL CHECK (length(free_answer) BETWEEN 1 AND 5000),
  q2 INTEGER NOT NULL CHECK (q2 BETWEEN 0 AND 6),
  q3 INTEGER NOT NULL CHECK (q3 BETWEEN 0 AND 4),
  q4 INTEGER NOT NULL CHECK (q4 BETWEEN 0 AND 6),
  gender INTEGER NULL CHECK (gender BETWEEN 0 AND 3),
  orientation INTEGER NULL CHECK (orientation BETWEEN 0 AND 4),
  created_at TEXT NOT NULL
);
CREATE INDEX idx_responses_created_at ON responses(created_at);
CREATE INDEX idx_responses_language ON responses(language);
CREATE TABLE rate_limits (
  ip_hash TEXT PRIMARY KEY,
  window_start INTEGER NOT NULL,
  count INTEGER NOT NULL
);
INSERT INTO responses
  (id, language, free_answer, q2, q3, q4, gender, orientation, created_at)
VALUES
  (7, 'en', 'Migration test record', 2, 3, 4, 1, 2, '2026-10-20T12:00:00.000Z');
INSERT INTO rate_limits (ip_hash, window_start, count)
VALUES ('test-only-key', 1792497600, 1);
""")

db.executescript(payload['migration'])

row = db.execute("""
SELECT id, language, free_answer, q2, q3, q4, gender, orientation,
       q2_other, q3_other, q4_other, signature, public_id, is_public, topic
FROM responses
""").fetchone()
assert row == (7, 'en', 'Migration test record', 2, 3, 4, 1, 2,
               None, None, None, None, 'legacy-7', 0, 'other'), row
assert db.execute("SELECT ip_hash, window_start, count FROM rate_limits").fetchone() == (
  'test-only-key', 1792497600, 1
)
assert db.execute("SELECT COUNT(*) FROM response_reactions").fetchone()[0] == 0
assert db.execute("SELECT COUNT(*) FROM topic_suggestions").fetchone()[0] == 0

columns = {r[1] for r in db.execute("PRAGMA table_info(responses)")}
assert {'q2_other', 'q3_other', 'q4_other', 'signature', 'public_id', 'is_public', 'topic'} <= columns

# New language codes are accepted, while unknown codes remain rejected.
db.execute("""
INSERT INTO responses (language, free_answer, q2, q3, q4, created_at)
VALUES ('es', 'Spanish test', 0, 0, 0, '2026-10-20T12:01:00.000Z')
""")
try:
    db.execute("""
    INSERT INTO responses (language, free_answer, q2, q3, q4, created_at)
    VALUES ('xx', 'Invalid language', 0, 0, 0, '2026-10-20T12:02:00.000Z')
    """)
except sqlite3.IntegrityError:
    pass
else:
    raise AssertionError('Unknown language code was accepted')

print(json.dumps({'preserved_response_id': row[0], 'rate_limits_preserved': True,
                  'new_tables_created': True, 'language_checks_passed': True}))
`;
  const result = spawnSync('python3', ['-c', python], {
    input: JSON.stringify({ migration }),
    encoding: 'utf8'
  });

  assert.equal(result.status, 0, `Migration regression failed:\n${result.stderr}\n${result.stdout}`);
  assert.match(result.stdout, /"preserved_response_id": 7/);
  assert.match(result.stdout, /"rate_limits_preserved": true/);
  assert.match(result.stdout, /"language_checks_passed": true/);
});
