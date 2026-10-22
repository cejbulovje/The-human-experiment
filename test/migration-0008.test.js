import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { runAIWithLease } from '../src/index.js';

const migration = readFileSync(
  new URL('../db/migrations/0008_ai_analysis_memory.sql', import.meta.url),
  'utf8'
);
const schema = readFileSync(new URL('../db/schema.sql', import.meta.url), 'utf8');

test('fresh schema includes persistent AI memory and singleton analysis lock', () => {
  assert.match(schema, /CREATE TABLE IF NOT EXISTS ai_analysis_memory/);
  assert.match(schema, /CREATE TABLE IF NOT EXISTS ai_analysis_lock/);
});

test('AI memory migration is idempotent and persists the analysis cursor', () => {
  const db = new DatabaseSync(':memory:');
  try {
    db.exec(migration);
    db.exec(migration);
    db.prepare(`
      INSERT INTO ai_analysis_memory
        (id, last_response_id, summary, response_count, updated_at)
      VALUES (1, ?, ?, ?, ?)
    `).run(25, 'Cumulative summary', 25, '2026-10-22T12:00:00.000Z');

    const memory = db.prepare(
      'SELECT last_response_id, summary, response_count FROM ai_analysis_memory WHERE id=1'
    ).get();
    assert.deepEqual(Object.values(memory), [25, 'Cumulative summary', 25]);
    assert.throws(() => db.prepare(`
      INSERT INTO ai_analysis_memory
        (id, last_response_id, summary, response_count, updated_at)
      VALUES (1, 26, 'duplicate', 26, '2026-10-22T12:01:00.000Z')
    `).run());
  } finally {
    db.close();
  }
});

test('expired lease can be claimed and previous owner cannot renew it', () => {
  const db = new DatabaseSync(':memory:');
  try {
    db.exec(migration);
    db.prepare('INSERT INTO ai_analysis_lock (id, token, expires_at) VALUES (1, ?, ?)').run(
      'old-owner', '2020-01-01T00:00:00.000Z'
    );
    const now = '2026-10-22T12:00:00.000Z';
    const claimed = db.prepare(`
      INSERT INTO ai_analysis_lock (id, token, expires_at) VALUES (1, ?, ?)
      ON CONFLICT(id) DO UPDATE SET token=excluded.token, expires_at=excluded.expires_at
      WHERE ai_analysis_lock.expires_at < ?
      RETURNING token
    `).get('new-owner', '2026-10-22T12:10:00.000Z', now);
    assert.equal(claimed.token, 'new-owner');

    const staleRenewal = db.prepare(`
      UPDATE ai_analysis_lock SET expires_at=?
      WHERE id=1 AND token=? AND expires_at>=?
      RETURNING token
    `).get('2026-10-22T12:20:00.000Z', 'old-owner', now);
    assert.equal(staleRenewal, undefined);
    assert.equal(db.prepare('SELECT token FROM ai_analysis_lock WHERE id=1').get().token, 'new-owner');
  } finally {
    db.close();
  }
});

test('AI lease is renewed while a model call is still pending', async () => {
  const db = new DatabaseSync(':memory:');
  const renewals = [];
  db.exec(migration);
  db.prepare('INSERT INTO ai_analysis_lock (id, token, expires_at) VALUES (1, ?, ?)').run(
    'active-owner', '2999-01-01T00:00:00.000Z'
  );
  const DB = {
    prepare(sql) {
      let values = [];
      return {
        bind(...args) { values = args; return this; },
        first() {
          const result = db.prepare(sql).get(...values);
          if (sql.startsWith('UPDATE ai_analysis_lock SET expires_at=')) renewals.push(result);
          return result;
        }
      };
    }
  };
  const AI = {
    async run() {
      await new Promise(resolve => setTimeout(resolve, 35));
      return { response: 'analysis complete' };
    }
  };
  try {
    const result = await runAIWithLease({ DB, AI }, 'active-owner', [{ role: 'user', content: 'test' }], 20, 5);
    assert.equal(result.response, 'analysis complete');
    assert.ok(renewals.length >= 2, 'lease should be renewed repeatedly while AI is pending');
    assert.ok(renewals.every(Boolean), 'each lease renewal should retain ownership');
  } finally {
    db.close();
  }
});

test('AI result is rejected if the lease is lost while the model call is pending', async () => {
  const db = new DatabaseSync(':memory:');
  db.exec(migration);
  db.prepare('INSERT INTO ai_analysis_lock (id, token, expires_at) VALUES (1, ?, ?)').run(
    'active-owner', '2999-01-01T00:00:00.000Z'
  );
  let renewalCount = 0;
  const DB = {
    prepare(sql) {
      let values = [];
      return {
        bind(...args) { values = args; return this; },
        first() {
          if (sql.startsWith('UPDATE ai_analysis_lock SET expires_at=')) {
            renewalCount++;
            db.prepare('UPDATE ai_analysis_lock SET token=?, expires_at=? WHERE id=1').run(
              'new-owner', '2999-01-01T00:00:00.000Z'
            );
            return undefined;
          }
          return db.prepare(sql).get(...values);
        }
      };
    }
  };
  const AI = { async run() { await new Promise(resolve => setTimeout(resolve, 25)); return { response: 'stale result' }; } };
  try {
    await assert.rejects(
      runAIWithLease({ DB, AI }, 'active-owner', [{ role: 'user', content: 'test' }], 20, 5),
      /analysis_lock_lost_during_ai_call/
    );
    assert.equal(renewalCount, 1);
    assert.equal(db.prepare('SELECT token FROM ai_analysis_lock WHERE id=1').get().token, 'new-owner');
  } finally {
    db.close();
  }
});
