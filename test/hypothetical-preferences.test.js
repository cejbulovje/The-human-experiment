import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import worker from '../src/index.js';
import { readFileSync } from 'node:fs';

const migration = readFileSync(new URL('../db/migrations/0010_hypothetical_preferences.sql', import.meta.url), 'utf8');
const schema = readFileSync(new URL('../db/schema.sql', import.meta.url), 'utf8');

test('hypothetical preferences migration is idempotent and isolated from survey responses', () => {
  const db = new DatabaseSync(':memory:');
  try {
    db.exec(migration);
    db.exec(migration);
    const table = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='hypothetical_preferences'").get();
    assert.equal(table.name, 'hypothetical_preferences');
    db.prepare('INSERT INTO hypothetical_preferences (language,answers_json,aggregate_consent,created_at) VALUES (?,?,?,?)')
      .run('ru', JSON.stringify({priority:'autonomy',preserve:'identity',wishes:'respect',body:'no_change'}), 1, '2026-10-23T00:00:00.000Z');
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM hypothetical_preferences').get().n, 1);
  } finally { db.close(); }
  assert.match(schema, /CREATE TABLE IF NOT EXISTS hypothetical_preferences/);
});

test('hypothetical preferences endpoint is disabled by default', async () => {
  const response = await worker.fetch(new Request('https://example.test/api/preferences', {
    method: 'POST',
    headers: {'content-type':'application/json'},
    body: JSON.stringify({})
  }), {});
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), {ok:false,error:'preferences_disabled'});
});

test('hypothetical preferences endpoint rejects missing consent and unexpected fields before external checks', async () => {
  const response = await worker.fetch(new Request('https://example.test/api/preferences', {
    method: 'POST',
    headers: {'content-type':'application/json'},
    body: JSON.stringify({
      language:'en',
      answers:{priority:'autonomy',preserve:'identity',wishes:'respect',body:'no_change'},
      aggregateConsent:true,
      turnstileToken:'token'
    })
  }), {PREFERENCES_ENABLED:'true', DB:{}, TURNSTILE_SECRET_KEY:'test-secret', RATE_LIMIT_SALT:'test-salt'});
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {ok:false,error:'invalid_response'});
});
