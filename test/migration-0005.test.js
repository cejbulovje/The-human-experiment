import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

const migration = readFileSync(
  new URL('../db/migrations/0005_legacy_production_schema.sql', import.meta.url),
  'utf8'
);

test('legacy Production migration preserves data and creates the current schema', () => {
  const db = new DatabaseSync(':memory:');
  try {
    db.exec('PRAGMA foreign_keys = ON');

    // Reproduce the original Production schema and representative existing data.
    db.exec(`
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
    `);

    db.exec(migration);

    const row = db.prepare(`
      SELECT id, language, free_answer, q2, q3, q4, gender, orientation,
             q2_other, q3_other, q4_other, signature, public_id, is_public, topic
      FROM responses
    `).get();
    assert.deepEqual(Object.values(row), [
      7, 'en', 'Migration test record', 2, 3, 4, 1, 2,
      null, null, null, null, 'legacy-7', 0, 'other'
    ]);

    const rateLimit = db.prepare(
      'SELECT ip_hash, window_start, count FROM rate_limits'
    ).get();
    assert.deepEqual(Object.values(rateLimit), ['test-only-key', 1792497600, 1]);
    assert.equal(db.prepare('SELECT COUNT(*) AS count FROM response_reactions').get().count, 0);
    assert.equal(db.prepare('SELECT COUNT(*) AS count FROM topic_suggestions').get().count, 0);

    const columns = new Set(
      db.prepare('PRAGMA table_info(responses)').all().map((column) => column.name)
    );
    for (const column of [
      'q2_other', 'q3_other', 'q4_other', 'signature', 'public_id', 'is_public', 'topic'
    ]) assert.ok(columns.has(column), `Missing migrated column: ${column}`);

    db.prepare(`
      INSERT INTO responses (language, free_answer, q2, q3, q4, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run('es', 'Spanish test', 0, 0, 0, '2026-10-20T12:01:00.000Z');

    assert.throws(() => db.prepare(`
      INSERT INTO responses (language, free_answer, q2, q3, q4, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run('xx', 'Invalid language', 0, 0, 0, '2026-10-20T12:02:00.000Z'));

  } finally {
    db.close();
  }
});
