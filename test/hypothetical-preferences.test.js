import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import worker from '../src/index.js';
import { readFileSync } from 'node:fs';

const migration = readFileSync(new URL('../db/migrations/0010_hypothetical_preferences.sql', import.meta.url), 'utf8');
const schema = readFileSync(new URL('../db/schema.sql', import.meta.url), 'utf8');

const expectedTable = `CREATE TABLE IF NOT EXISTS hypothetical_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  language TEXT NOT NULL CHECK (language IN ('en','ru','es','pt','zh','de','ja','fr','ar')),
  answers_json TEXT NOT NULL CHECK (json_valid(answers_json)),
  aggregate_consent INTEGER NOT NULL CHECK (aggregate_consent IN (0,1)),
  delete_token_hash TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_hypothetical_preferences_created_at
  ON hypothetical_preferences(created_at);`;

function schemaFor(sql) {
  const start = sql.indexOf('CREATE TABLE IF NOT EXISTS hypothetical_preferences');
  assert.notEqual(start, -1, 'hypothetical_preferences table must be present');
  const end = sql.indexOf(';', start + 10);
  const indexEnd = sql.indexOf(';', sql.indexOf('CREATE INDEX IF NOT EXISTS idx_hypothetical_preferences_created_at', end));
  return sql.slice(start, indexEnd + 1).trim().replace(/\r\n/g, '\n');
}

test('schema.sql and migration define the same isolated preferences table and index', () => {
  assert.equal(schemaFor(schema), schemaFor(migration));
  assert.match(schemaFor(schema), /delete_token_hash TEXT NOT NULL UNIQUE/);
  assert.match(schemaFor(migration), /aggregate_consent INTEGER NOT NULL CHECK \(aggregate_consent IN \(0,1\)\)/);
});

test('hypothetical preferences migration is idempotent, validates fields, and stays isolated', () => {
  const db = new DatabaseSync(':memory:');
  try {
    db.exec(migration);
    db.exec(migration);
    const table = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='hypothetical_preferences'").get();
    assert.equal(table.name, 'hypothetical_preferences');
    const columns = db.prepare("PRAGMA table_info('hypothetical_preferences')").all();
    assert.deepEqual(columns.map(column => column.name), ['id', 'language', 'answers_json', 'aggregate_consent', 'delete_token_hash', 'created_at']);
    assert.equal(columns.find(column => column.name === 'delete_token_hash').notnull, 1);

    const insert = db.prepare('INSERT INTO hypothetical_preferences (language,answers_json,aggregate_consent,delete_token_hash,created_at) VALUES (?,?,?,?,?)');
    insert.run('ru', JSON.stringify({priority:'autonomy',preserve:'identity',wishes:'respect',body:'no_change'}), 1, 'hash-example', '2026-10-23T00:00:00.000Z');
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM hypothetical_preferences').get().n, 1);
    assert.throws(() => insert.run('xx', '{}', 1, 'hash-lang', '2026-10-23T00:00:00.000Z'));
    assert.throws(() => insert.run('en', '{invalid-json', 1, 'hash-json', '2026-10-23T00:00:00.000Z'));
    assert.throws(() => insert.run('en', '{}', 2, 'hash-consent', '2026-10-23T00:00:00.000Z'));
    assert.throws(() => insert.run('en', '{}', 1, 'hash-example', '2026-10-23T00:00:00.000Z'));
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM sqlite_master WHERE type='table' AND name='responses'").get().n, 0);
  } finally { db.close(); }
});

test('hypothetical preferences endpoint stays disabled by default', async () => {
  const response = await worker.fetch(new Request('https://example.test/api/preferences', {
    method: 'POST',
    headers: {'content-type':'application/json'},
    body: JSON.stringify({})
  }), {});
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), {ok:false,error:'preferences_disabled'});
});

test('hypothetical preferences requires affirmative storage consent and rejects unexpected answer values', async () => {
  const base = {
    language:'en',
    answers:{priority:'autonomy',preserve:'identity',wishes:'respect',body:'no_change'},
    aggregateConsent:true,
    turnstileToken:'token'
  };
  for (const body of [
    base,
    {...base, consentToStore:false},
    {...base, consentToStore:true, answers:{...base.answers, unexpected:'value'}},
    {...base, consentToStore:true, answers:{...base.answers, priority:'made-up'}}
  ]) {
    const response = await worker.fetch(new Request('https://example.test/api/preferences', {
      method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify(body)
    }), {PREFERENCES_ENABLED:'true', DB:{}, TURNSTILE_SECRET_KEY:'test-secret', RATE_LIMIT_SALT:'test-salt'});
    assert.equal(response.status,400);
    assert.deepEqual(await response.json(),{ok:false,error:'invalid_response'});
  }
});

test('preferences endpoint rejects oversized request bodies before storage', async () => {
  const response = await worker.fetch(new Request('https://example.test/api/preferences', {
    method:'POST',headers:{'content-type':'application/json'},
    body:JSON.stringify({payload:'x'.repeat(5000)})
  }), {PREFERENCES_ENABLED:'true',DB:{},TURNSTILE_SECRET_KEY:'test-secret',RATE_LIMIT_SALT:'test-salt'});
  assert.equal(response.status,413);
  assert.deepEqual(await response.json(),{ok:false,error:'too_large'});
});

test('deletion endpoint stays disabled by default', async () => {
  const response = await worker.fetch(new Request('https://example.test/api/preferences/delete', {
    method:'POST',headers:{'content-type':'application/json'},
    body:JSON.stringify({deletionToken:'x'.repeat(64)})
  }), {});
  assert.equal(response.status,503);
  assert.deepEqual(await response.json(),{ok:false,error:'preferences_disabled'});
});

test('deletion endpoint rejects malformed tokens before database access', async () => {
  const response = await worker.fetch(new Request('https://example.test/api/preferences/delete', {
    method:'POST',headers:{'content-type':'application/json'},
    body:JSON.stringify({deletionToken:'short'})
  }), {PREFERENCES_ENABLED:'true',DB:{},RATE_LIMIT_SALT:'test-salt'});
  assert.equal(response.status,400);
  assert.deepEqual(await response.json(),{ok:false,error:'invalid_token'});
});

test('both preference routes are reachable only through the worker handler and AI route is inside fetch', async () => {
  const index = readFileSync(new URL('../src/index.js', import.meta.url), 'utf8');
  const fetchStart = index.indexOf('export default {');
  const fetchEnd = index.indexOf('  }\n};', fetchStart);
  const fetchBody = index.slice(fetchStart, fetchEnd);
  assert.match(fetchBody, /url\.pathname===['"]\/api\/preferences['"].*submitPreferences/);
  assert.match(fetchBody, /url\.pathname===['"]\/api\/preferences\/delete['"].*deletePreferences/);
  assert.match(fetchBody, /url\.pathname===['"]\/api\/ai-analysis['"].*aiAnalysis/);
  assert.equal((index.match(/url\.pathname===['"]\/api\/ai-analysis['"]/g) || []).length, 1);
});
