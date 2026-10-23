import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/index.js';

test('submit returns 409 when unique participant index catches a race after the pre-check', async () => {
  const statements = [];
  const DB = {
    prepare(sql) {
      statements.push(sql);
      let values = [];
      return {
        bind(...args) { values = args; return this; },
        async first() {
          if (sql.includes('SELECT 1 AS submitted FROM responses')) return null;
          if (sql.includes('INSERT INTO rate_limits')) return { count: 1 };
          throw new Error('Unexpected first() query: ' + sql);
        },
        async run() {
          if (sql.startsWith('CREATE TABLE IF NOT EXISTS feedback_contacts')) return { success: true };\n          if (sql.startsWith('DELETE FROM rate_limits')) return { success: true };
          if (sql.startsWith('INSERT INTO responses')) {
            assert.equal(values.at(-1), '11111111-1111-4111-8111-111111111111');
            throw new Error('UNIQUE constraint failed: responses.participant_id');
          }
          throw new Error('Unexpected run() query: ' + sql);
        }
      };
    }
  };
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    assert.match(String(url), /challenges\.cloudflare\.com\/turnstile\/v0\/siteverify/);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'content-type': 'application/json' }
    });
  };
  try {
    const response = await worker.fetch(new Request('https://example.test/api/submit', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        language: 'en',
        freeAnswer: 'I would respect personal choice',
        q2: 0,
        q3: 0,
        q4: 0,
        authorConfirmed: true,
        participantId: '11111111-1111-4111-8111-111111111111',
        turnstileToken: 'valid-test-token'
      })
    }), {
      DB,
      TURNSTILE_SECRET_KEY: 'test-secret',
      RATE_LIMIT_SALT: 'test-salt'
    });

    assert.equal(response.status, 409);
    assert.deepEqual(await response.json(), { ok: false, error: 'already_submitted' });
    assert.ok(statements.some(sql => sql.includes('SELECT 1 AS submitted FROM responses')));
    assert.ok(statements.some(sql => sql.startsWith('INSERT INTO responses')));
  } finally {
    globalThis.fetch = originalFetch;
  }
});
