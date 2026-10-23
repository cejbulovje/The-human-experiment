import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/index.js';

test('submit reports saved answer when optional feedback email storage fails', async () => {
  const statements = [];
  let responseSaved = false;
  const DB = {
    prepare(sql) {
      statements.push(sql);
      let values = [];
      return {
        bind(...args) { values = args; return this; },
        async first() {
          if (sql.includes('INSERT INTO rate_limits')) return { count: 1 };
          if (sql.includes('SELECT COUNT(*) AS total FROM responses WHERE is_public=1')) {
            if (responseSaved) return { total: 1 };
            throw new Error('Unexpected results query');
          }
          throw new Error('Unexpected first() query: ' + sql);
        },
        async run() {
          if (sql.startsWith('CREATE TABLE IF NOT EXISTS feedback_contacts')) return { success: true };
          if (sql.startsWith('DELETE FROM rate_limits')) return { success: true };
          if (sql.startsWith('INSERT INTO responses')) {
            responseSaved = true;
            return { success: true, meta: { changes: 1 } };
          }
          if (sql.startsWith('INSERT INTO feedback_contacts')) {
            assert.equal(responseSaved, true, 'the public answer is inserted before optional email storage');
            throw new Error('Simulated feedback_contacts storage failure');
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
        feedbackEmail: 'person@example.com',
        turnstileToken: 'valid-test-token'
      })
    }), {
      DB,
      TURNSTILE_SECRET_KEY: 'test-secret',
      RATE_LIMIT_SALT: 'test-salt'
    });

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true, feedbackEmailSaved: false });
    assert.equal(responseSaved, true);
    assert.ok(statements.some(sql => sql.startsWith('INSERT INTO feedback_contacts')));
  } finally {
    globalThis.fetch = originalFetch;
  }
});
