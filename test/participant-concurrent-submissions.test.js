import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/index.js';

test('concurrent submissions with the same participant ID save at most one response', async () => {
  const participantId = '11111111-1111-4111-8111-111111111111';
  const savedParticipants = new Set();
  let prechecks = 0;
  let releasePrechecks;
  const bothPrechecks = new Promise(resolve => { releasePrechecks = resolve; });

  const DB = {
    prepare(sql) {
      let values = [];
      return {
        bind(...args) { values = args; return this; },
        async first() {
          if (sql.includes('SELECT 1 AS submitted FROM responses')) {
            // Force both requests to pass the pre-check before either can insert.
            prechecks += 1;
            if (prechecks === 2) releasePrechecks();
            await bothPrechecks;
            return null;
          }
          if (sql.includes('INSERT INTO rate_limits')) return { count: 1 };
          if (sql.includes('SELECT COUNT(*) AS total FROM responses WHERE is_public=1')) return { total: 0 };
          throw new Error('Unexpected first() query: ' + sql);
        },
        async run() {
          if (sql.startsWith('CREATE TABLE IF NOT EXISTS feedback_contacts')) return { success: true };
          if (sql.startsWith('DELETE FROM rate_limits')) return { success: true };
          if (sql.startsWith('INSERT INTO responses')) {
            assert.equal(values.at(-1), participantId);
            // Model the database's unique partial index as an atomic constraint.
            if (savedParticipants.has(participantId)) {
              throw new Error('UNIQUE constraint failed: responses.participant_id');
            }
            savedParticipants.add(participantId);
            return { success: true, meta: { changes: 1 } };
          }
          if (sql.startsWith('INSERT INTO public_results_snapshot')) return { success: true };
          throw new Error('Unexpected run() query: ' + sql);
        }
      };
    }
  };

  const originalFetch = globalThis.fetch;
  globalThis.fetch = async url => {
    assert.match(String(url), /challenges\.cloudflare\.com\/turnstile\/v0\/siteverify/);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'content-type': 'application/json' }
    });
  };

  const makeRequest = () => worker.fetch(new Request('https://example.test/api/submit', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
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

  try {
    const responses = await Promise.all([makeRequest(), makeRequest()]);
    const statuses = responses.map(response => response.status).sort((a, b) => a - b);
    assert.deepEqual(statuses, [200, 409]);
    assert.equal(savedParticipants.size, 1);
    const bodies = await Promise.all(responses.map(response => response.json()));
    assert.equal(bodies.filter(body => body.ok === true).length, 1);
    assert.equal(bodies.filter(body => body.error === 'already_submitted').length, 1);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
