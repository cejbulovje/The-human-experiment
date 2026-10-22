import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { highestReachedResultsThreshold, nextResultsThreshold } from '../src/index.js';

const migration = readFileSync(
  new URL('../db/migrations/0009_public_results_snapshots.sql', import.meta.url),
  'utf8'
);
const schema = readFileSync(new URL('../db/schema.sql', import.meta.url), 'utf8');

test('public results snapshot migration is idempotent and stores the published version', () => {
  const db = new DatabaseSync(':memory:');
  try {
    db.exec(migration);
    db.exec(migration);
    db.prepare(`INSERT INTO public_results_snapshot
      (id,published_threshold,total,updated_at,q2,q3,q4,answered)
      VALUES (1,?,?,?,?,?,?,?)`).run(
      100, 105, '2026-10-23T00:00:00.000Z', '[]', '[]', '[]', '{}'
    );
    const row = db.prepare('SELECT published_threshold,total FROM public_results_snapshot WHERE id=1').get();
    assert.deepEqual(Object.values(row), [100, 105]);
  } finally {
    db.close();
  }
  assert.match(schema, /CREATE TABLE IF NOT EXISTS public_results_snapshot/);
});

test('publication thresholds follow 100, 500, then the 1-2-5 progression', () => {
  assert.equal(highestReachedResultsThreshold(99), 0);
  assert.equal(highestReachedResultsThreshold(100), 100);
  assert.equal(highestReachedResultsThreshold(499, 100), 100);
  assert.equal(highestReachedResultsThreshold(500, 100), 500);
  assert.equal(highestReachedResultsThreshold(1500, 500), 1000);
  assert.equal(highestReachedResultsThreshold(4999, 1000), 2000);
  assert.equal(highestReachedResultsThreshold(5000, 2000), 5000);
  assert.equal(highestReachedResultsThreshold(23000, 10000), 20000);
  assert.equal(highestReachedResultsThreshold(80000, 50000), 50000);
});

test('next published milestone skips already reached thresholds', () => {
  assert.equal(nextResultsThreshold(0), 100);
  assert.equal(nextResultsThreshold(100), 500);
  assert.equal(nextResultsThreshold(500), 1000);
  assert.equal(nextResultsThreshold(1000), 2000);
  assert.equal(nextResultsThreshold(5000), 10000);
  assert.equal(nextResultsThreshold(1000000), 2000000);
});
