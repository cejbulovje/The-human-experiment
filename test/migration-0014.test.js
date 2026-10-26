import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

const migration = readFileSync(
  new URL('../db/migrations/0014_ai_analysis_stream_limits.sql', import.meta.url),
  'utf8'
);
const schema = readFileSync(new URL('../db/schema.sql', import.meta.url), 'utf8');

test('AI stream limit migration preserves existing daily visitors as collective usage', () => {
  const db = new DatabaseSync(':memory:');
  try {
    db.exec(`CREATE TABLE ai_daily_visitors (
      day TEXT NOT NULL,
      ip_hash TEXT NOT NULL,
      created_at TEXT NOT NULL,
      PRIMARY KEY(day,ip_hash)
    )`);
    db.prepare('INSERT INTO ai_daily_visitors(day,ip_hash,created_at) VALUES(?,?,?)')
      .run('2026-10-26', 'existing-hash', '2026-10-26T10:00:00.000Z');
    db.exec(migration);
    const rows = db.prepare('SELECT day,ip_hash,stream,created_at FROM ai_daily_visitors').all();
    assert.deepEqual(rows, [{
      day: '2026-10-26',
      ip_hash: 'existing-hash',
      stream: 'collective',
      created_at: '2026-10-26T10:00:00.000Z'
    }]);
    db.prepare('INSERT INTO ai_daily_visitors(day,ip_hash,stream,created_at) VALUES(?,?,?,?)')
      .run('2026-10-26', 'existing-hash', 'hypothetical', '2026-10-26T11:00:00.000Z');
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM ai_daily_visitors').get().n, 2);
    assert.throws(() => db.prepare('INSERT INTO ai_daily_visitors(day,ip_hash,stream,created_at) VALUES(?,?,?,?)')
      .run('2026-10-26', 'existing-hash', 'collective', '2026-10-26T12:00:00.000Z'));
  } finally {
    db.close();
  }
  assert.match(schema, /PRIMARY KEY \(day, ip_hash, stream\)/);
  assert.match(schema, /CREATE TABLE IF NOT EXISTS ai_hypothetical_analysis_memory/);
});
