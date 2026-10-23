import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import worker from '../src/index.js';
import { readFileSync } from 'node:fs';

const migration = readFileSync(new URL('../db/migrations/0010_hypothetical_preferences.sql', import.meta.url), 'utf8');
const schema = readFileSync(new URL('../db/schema.sql', import.meta.url), 'utf8');

function createPreferencesDb() {
  const records = new Map();
  let nextId = 1;
  const rateCounts = new Map();
  const db = {
    records,
    prepare(sql) {
      let params = [];
      const statement = {
        bind(...values) { params = values; return statement; },
        async first() {
          if (sql.includes('INSERT INTO rate_limits')) {
            const key = params[0];
            const count = (rateCounts.get(key) || 0) + 1;
            rateCounts.set(key, count);
            return {count};
          }
          if (sql.includes('DELETE FROM hypothetical_preferences WHERE delete_token_hash = ?')) {
            const hash = params[0];
            const existing = [...records.entries()].find(([, row]) => row.delete_token_hash === hash);
            return existing ? {id: existing[0]} : null;
          }
          return null;
        },
        async run() {
          if (sql.includes('INSERT INTO hypothetical_preferences')) {
            const [language, answers_json, aggregate_consent, delete_token_hash, created_at] = params;
            if ([...records.values()].some(row => row.delete_token_hash === delete_token_hash)) throw new Error('unique');
            const id = nextId++;
            records.set(id, {id, language, answers_json, aggregate_consent, delete_token_hash, created_at});
            return {success:true,meta:{changes:1}};
          }
          if (sql.includes('DELETE FROM hypothetical_preferences WHERE delete_token_hash = ?')) {
            const hash = params[0];
            for (const [id, row] of records.entries()) if (row.delete_token_hash === hash) records.delete(id);
            return {success:true,meta:{changes:1}};
          }
          return {success:true,meta:{changes:0}};
        }
      };
      return statement;
    }
  };
  return db;
}

function preferencesSql(sql) {
  const start = sql.indexOf('CREATE TABLE IF NOT EXISTS hypothetical_preferences');
  assert.notEqual(start, -1, 'hypothetical_preferences table must be defined');
  const indexStart = sql.indexOf('CREATE INDEX IF NOT EXISTS idx_hypothetical_preferences_created_at', start);
  assert.notEqual(indexStart, -1, 'preferences index must be defined');
  const end = sql.indexOf(';', indexStart);
  assert.notEqual(end, -1, 'preferences index statement must terminate');
  return sql.slice(start, end + 1).trim().replace(/\r\n/g, '\n');
}

test('schema.sql and migration define the same isolated preferences table and index', () => {
  assert.equal(preferencesSql(schema), preferencesSql(migration));
  assert.match(preferencesSql(schema), /delete_token_hash TEXT NOT NULL UNIQUE/);
  assert.match(preferencesSql(migration), /aggregate_consent INTEGER NOT NULL CHECK \(aggregate_consent IN \(0,1\)\)/);
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

    assert.throws(() => insert.run('xx', '{}', 1, 'hash-language', '2026-10-23T00:00:00.000Z'));
    assert.throws(() => insert.run('en', '{invalid-json', 1, 'hash-json', '2026-10-23T00:00:00.000Z'));
    assert.throws(() => insert.run('en', '{}', 2, 'hash-consent', '2026-10-23T00:00:00.000Z'));
    assert.throws(() => insert.run('en', '{}', 1, 'hash-example', '2026-10-23T00:00:00.000Z'));

    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM sqlite_master WHERE type='table' AND name='responses'").get().n, 0);
  } finally {
    db.close();
  }
});


test('valid preference submission stores only a deletion-token hash and returns one-time token', async t => {
  const db = createPreferencesDb();
  t.mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify({success:true}), {status:200,headers:{'content-type':'application/json'}}));
  const body = {
    language:'en',
    answers:{priority:'autonomy',preserve:'identity',wishes:'respect',body:'no_change'},
    aggregateConsent:true,
    consentToStore:true,
    turnstileToken:'valid-test-token'
  };
  const response = await worker.fetch(new Request('https://example.test/api/preferences', {
    method:'POST',headers:{'content-type':'application/json','CF-Connecting-IP':'192.0.2.10'},body:JSON.stringify(body)
  }), {PREFERENCES_ENABLED:'true',DB:db,TURNSTILE_SECRET_KEY:'test-secret',RATE_LIMIT_SALT:'test-salt'});
  assert.equal(response.status,200);
  const result = await response.json();
  assert.equal(result.ok,true);
  assert.equal(typeof result.deletionToken,'string');
  assert.ok(result.deletionToken.length>=60);
  assert.equal(db.records.size,1);
  const stored = [...db.records.values()][0];
  assert.notEqual(stored.delete_token_hash,result.deletionToken);
  assert.equal(stored.delete_token_hash.length,64);
  assert.equal(stored.aggregate_consent,1);
  assert.deepEqual(JSON.parse(stored.answers_json),body.answers);
});

test('deletion token removes the matching preference and unknown token returns same public response', async t => {
  const db = createPreferencesDb();
  t.mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify({success:true}), {status:200,headers:{'content-type':'application/json'}}));
  const body = {
    language:'en',
    answers:{priority:'autonomy',preserve:'identity',wishes:'respect',body:'no_change'},
    aggregateConsent:false,
    consentToStore:true,
    turnstileToken:'valid-test-token'
  };
  const env = {PREFERENCES_ENABLED:'true',DB:db,TURNSTILE_SECRET_KEY:'test-secret',RATE_LIMIT_SALT:'test-salt'};
  const submitted = await worker.fetch(new Request('https://example.test/api/preferences', {
    method:'POST',headers:{'content-type':'application/json','CF-Connecting-IP':'192.0.2.11'},body:JSON.stringify(body)
  }),env);
  assert.equal(submitted.status,200);
  const {deletionToken} = await submitted.json();
  const deletionRequest = token => new Request('https://example.test/api/preferences/delete', {
    method:'POST',headers:{'content-type':'application/json','CF-Connecting-IP':'192.0.2.12'},body:JSON.stringify({deletionToken:token})
  });
  const deleted = await worker.fetch(deletionRequest(deletionToken),env);
  const unknown = await worker.fetch(deletionRequest('f'.repeat(64)),env);
  assert.equal(deleted.status,200);
  assert.equal(unknown.status,200);
  assert.deepEqual(await deleted.json(),{ok:true});
  assert.deepEqual(await unknown.json(),{ok:true});
  assert.equal(db.records.size,0);
});

test('preference submission enforces the three-request rate limit per IP', async t => {
  const db = createPreferencesDb();
  t.mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify({success:true}), {status:200,headers:{'content-type':'application/json'}}));
  const body = {
    language:'en',
    answers:{priority:'autonomy',preserve:'identity',wishes:'respect',body:'no_change'},
    aggregateConsent:true,
    consentToStore:true,
    turnstileToken:'valid-test-token'
  };
  const env = {PREFERENCES_ENABLED:'true',DB:db,TURNSTILE_SECRET_KEY:'test-secret',RATE_LIMIT_SALT:'test-salt'};
  const submit = () => worker.fetch(new Request('https://example.test/api/preferences', {
    method:'POST',
    headers:{'content-type':'application/json','CF-Connecting-IP':'192.0.2.14'},
    body:JSON.stringify(body)
  }),env);

  for (let i=0;i<3;i++) {
    const response = await submit();
    assert.equal(response.status,200);
  }
  const limited = await submit();
  assert.equal(limited.status,429);
  assert.deepEqual(await limited.json(),{ok:false,error:'rate_limited'});
  assert.equal(db.records.size,3);
});

test('preference submission rejects Turnstile failure without writing data', async t => {
  const db = createPreferencesDb();
  t.mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify({success:false}), {status:200,headers:{'content-type':'application/json'}}));
  const response = await worker.fetch(new Request('https://example.test/api/preferences', {
    method:'POST',headers:{'content-type':'application/json','CF-Connecting-IP':'192.0.2.13'},
    body:JSON.stringify({language:'en',answers:{priority:'autonomy',preserve:'identity',wishes:'respect',body:'no_change'},aggregateConsent:true,consentToStore:true,turnstileToken:'invalid-token'})
  }), {PREFERENCES_ENABLED:'true',DB:db,TURNSTILE_SECRET_KEY:'test-secret',RATE_LIMIT_SALT:'test-salt'});
  assert.equal(response.status,400);
  assert.deepEqual(await response.json(),{ok:false,error:'captcha_failed'});
  assert.equal(db.records.size,0);
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

test('preferences and AI endpoint routes are inside fetch and AI dispatch precedes API fallback', async () => {
  const index = readFileSync(new URL('../src/index.js', import.meta.url), 'utf8');
  const fetchStart = index.indexOf('export default {');
  const fetchEnd = index.indexOf('  }\n};', fetchStart);
  assert.notEqual(fetchStart, -1);
  assert.notEqual(fetchEnd, -1);
  const fetchBody = index.slice(fetchStart, fetchEnd);

  const preferenceRoute = "url.pathname==='/api/preferences'&&request.method==='POST'";
  const deleteRoute = "url.pathname==='/api/preferences/delete'&&request.method==='POST'";
  const aiRoute = "url.pathname==='/api/ai-analysis'&&request.method==='POST'";
  const apiFallback = "url.pathname.startsWith('/api/')";

  assert.ok(fetchBody.includes(preferenceRoute));
  assert.ok(fetchBody.includes(deleteRoute));
  assert.ok(fetchBody.includes(aiRoute));
  assert.ok(fetchBody.indexOf(aiRoute) < fetchBody.indexOf(apiFallback));
  assert.equal((index.match(/url\.pathname==='\/api\/ai-analysis'/g) || []).length, 1);
});
