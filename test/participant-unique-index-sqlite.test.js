import test from 'node:test';
import worker from '../src/index.js';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';

const schema = readFileSync(new URL('../db/schema.sql', import.meta.url), 'utf8');

test('prototype schema enforces unique non-null participant IDs and allows multiple NULL IDs', () => {
  const db = new DatabaseSync(':memory:');
  try {
    db.exec(schema);

    const insert = db.prepare(`
      INSERT INTO responses (language, free_answer, q2, q3, q4, created_at, participant_id)
      VALUES ('en', ?, 0, 0, 0, ?, ?)
    `);
    const participantId = '11111111-1111-4111-8111-111111111111';

    insert.run('First linked response', '2026-10-24T12:00:00.000Z', participantId);
    assert.throws(
      () => insert.run('Duplicate linked response', '2026-10-24T12:01:00.000Z', participantId),
      error => String(error.message).includes('UNIQUE constraint failed: responses.participant_id')
    );

    insert.run('Anonymous response one', '2026-10-24T12:02:00.000Z', null);
    insert.run('Anonymous response two', '2026-10-24T12:03:00.000Z', null);

    assert.equal(
      db.prepare('SELECT COUNT(*) AS n FROM responses WHERE participant_id = ?').get(participantId).n,
      1
    );
    assert.equal(
      db.prepare('SELECT COUNT(*) AS n FROM responses WHERE participant_id IS NULL').get().n,
      2
    );
  } finally {
    db.close();
  }
});

test('concurrent API submissions against SQLite save only one response', async () => {
  const db = new DatabaseSync(':memory:');
  db.exec(schema);

  let prechecks = 0;
  let releasePrechecks;
  const bothPrechecks = new Promise(resolve => { releasePrechecks = resolve; });

  const DB = {
    prepare(sql) {
      let values = [];
      return {
        bind(...args) { values = args; return this; },
        async first() {
          const statement = db.prepare(sql);
          const result = statement.get(...values);
          if (sql.includes('SELECT 1 AS submitted FROM responses')) {
            prechecks += 1;
            if (prechecks === 2) releasePrechecks();
            await bothPrechecks;
          }
          return result;
        },
        async run() {
          const result = db.prepare(sql).run(...values);
          return { success: true, meta: { changes: Number(result.changes || 0) } };
        },
        async all() {
          return { results: db.prepare(sql).all(...values) };
        }
      };
    }
  };

  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'content-type': 'application/json' }
  });

  try {
    const participantId = '22222222-2222-4222-8222-222222222222';
    const makeRequest = () => worker.fetch(new Request('https://example.test/api/submit', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'CF-Connecting-IP': '192.0.2.10' },
      body: JSON.stringify({
        language: 'en',
        freeAnswer: 'I would respect personal choice',
        q2: 0,
        q3: 0,
        q4: 0,
        authorConfirmed: true,
        participantId,
        turnstileToken: 'valid-test-token'
      })
    }), {
      DB,
      TURNSTILE_SECRET_KEY: 'test-secret',
      RATE_LIMIT_SALT: 'test-salt'
    });

    const responses = await Promise.all([makeRequest(), makeRequest()]);
    assert.deepEqual(responses.map(response => response.status).sort((a, b) => a - b), [200, 409]);
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM responses WHERE participant_id = ?').get(participantId).n, 1);
    const bodies = await Promise.all(responses.map(response => response.json()));
    assert.equal(bodies.filter(body => body.ok === true).length, 1);
    assert.equal(bodies.filter(body => body.error === 'already_submitted').length, 1);
  } finally {
    globalThis.fetch = originalFetch;
    db.close();
  }
});

test('unique participant migration can be applied repeatedly and creates the expected partial index', () => {
  const db = new DatabaseSync(':memory:');
  try {
    const schemaWithoutUniqueIndex = schema.replace(
      'CREATE UNIQUE INDEX IF NOT EXISTS idx_responses_participant_id_unique\n  ON responses(participant_id)\n  WHERE participant_id IS NOT NULL;',
      ''
    );
    db.exec(schemaWithoutUniqueIndex);
    const migration = readFileSync(new URL('../db/migrations/0011_unique_participant_id.sql', import.meta.url), 'utf8');

    db.exec(migration);
    db.exec(migration);

    const index = db.prepare("SELECT sql FROM sqlite_master WHERE type='index' AND name='idx_responses_participant_id_unique'").get();
    assert.ok(index);
    assert.match(index.sql, /WHERE participant_id IS NOT NULL/i);
  } finally {
    db.close();
  }
});
