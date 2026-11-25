import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import worker from '../src/index.js';
import { readFileSync } from 'node:fs';

const migration = readFileSync(new URL('../db/migrations/0010_hypothetical_preferences.sql', import.meta.url), 'utf8');
const extensionMigration = readFileSync(new URL('../db/migrations/0012_hypothetical_preferences_public_fields.sql', import.meta.url), 'utf8');
const publicPreferencesMigration = readFileSync(new URL('../db/migrations/0015_hypothetical_preferences_public_fields.sql', import.meta.url), 'utf8');
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
            const [language, answers_json, aggregate_consent, delete_token_hash, created_at, comment, public_consent] = params;
            if ([...records.values()].some(row => row.delete_token_hash === delete_token_hash)) throw new Error('unique');
            const id = nextId++;
            records.set(id, {id, language, answers_json, aggregate_consent, delete_token_hash, created_at, comment, public_consent});
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

test('schema.sql includes the additive public fields while migration 0010 remains the legacy base', () => {
  assert.match(preferencesSql(schema), /delete_token_hash TEXT NOT NULL UNIQUE/);
  assert.match(preferencesSql(migration), /aggregate_consent INTEGER NOT NULL CHECK \(aggregate_consent IN \(0,1\)\)/);
  assert.match(preferencesSql(schema), /comment TEXT/);
  assert.match(preferencesSql(schema), /public_consent INTEGER NOT NULL DEFAULT 1 CHECK \(public_consent IN \(0,1\)\)/);
  assert.match(preferencesSql(schema), /pseudonym TEXT CHECK \(pseudonym IS NULL OR length\(pseudonym\) <= 60\)/);
  assert.match(schema, /CREATE INDEX IF NOT EXISTS idx_hypothetical_preferences_public_created\s+ON hypothetical_preferences\(public_consent, created_at\)/);
  assert.match(extensionMigration, /ALTER TABLE hypothetical_preferences ADD COLUMN comment TEXT/);
  assert.match(extensionMigration, /ALTER TABLE hypothetical_preferences ADD COLUMN public_consent INTEGER NOT NULL DEFAULT 1 CHECK \(public_consent IN \(0,1\)\)/);
  assert.match(publicPreferencesMigration, /ADD COLUMN pseudonym TEXT CHECK \(pseudonym IS NULL OR length\(pseudonym\) <= 60\)/);
  assert.doesNotMatch(publicPreferencesMigration, /ADD COLUMN (?:comment|public_consent)/);
});

test('hypothetical preferences migrations preserve existing rows and validate fields', () => {
  const db = new DatabaseSync(':memory:');
  try {
    db.exec(migration);
    const insert = db.prepare('INSERT INTO hypothetical_preferences (language,answers_json,aggregate_consent,delete_token_hash,created_at) VALUES (?,?,?,?,?)');
    insert.run('ru', JSON.stringify({priority:'autonomy',preserve:['identity'],wishes:'ask',body:'consent'}), 1, 'hash-existing', '2026-10-23T00:00:00.000Z');
    db.exec(extensionMigration);
    assert.throws(() => db.exec(extensionMigration), /duplicate column name/i);
    db.exec(publicPreferencesMigration);

    const table = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='hypothetical_preferences'").get();
    assert.equal(table.name, 'hypothetical_preferences');
    const columns = db.prepare("PRAGMA table_info('hypothetical_preferences')").all();
    assert.deepEqual(columns.map(column => column.name), ['id', 'language', 'answers_json', 'aggregate_consent', 'delete_token_hash', 'created_at', 'comment', 'public_consent', 'pseudonym']);
    assert.equal(columns.find(column => column.name === 'delete_token_hash').notnull, 1);
    assert.equal(columns.find(column => column.name === 'public_consent').notnull, 1);
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM hypothetical_preferences').get().n, 1);
    const preserved = db.prepare('SELECT comment, public_consent, pseudonym FROM hypothetical_preferences WHERE delete_token_hash=?').get('hash-existing');
    assert.equal(preserved.comment, null);
    assert.equal(preserved.public_consent, 1);
    assert.equal(preserved.pseudonym, null);
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM sqlite_master WHERE type='index' AND name='idx_hypothetical_preferences_public_created'").get().n, 1);

    const insertExtended = db.prepare('INSERT INTO hypothetical_preferences (language,answers_json,aggregate_consent,delete_token_hash,created_at,comment,public_consent,pseudonym) VALUES (?,?,?,?,?,?,?,?)');
    insertExtended.run('en', '{}', 1, 'hash-new', '2026-10-23T00:00:00.000Z', 'example', 1, 'Guest');
    assert.throws(() => insertExtended.run('en', '{}', 1, 'hash-bad-pseudonym', '2026-10-23T00:00:00.000Z', null, 1, 'x'.repeat(61)));
    assert.throws(() => insert.run('xx', '{}', 1, 'hash-language', '2026-10-23T00:00:00.000Z'));
    assert.throws(() => insert.run('en', '{invalid-json', 1, 'hash-json', '2026-10-23T00:00:00.000Z'));
    assert.throws(() => insert.run('en', '{}', 2, 'hash-consent', '2026-10-23T00:00:00.000Z'));
    assert.throws(() => insert.run('en', '{}', 1, 'hash-existing', '2026-10-23T00:00:00.000Z'));
    assert.throws(() => insertExtended.run('en', '{}', 1, 'hash-bad-consent', '2026-10-23T00:00:00.000Z', null, 2));
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM sqlite_master WHERE type='table' AND name='responses'").get().n, 0);
  } finally {
    db.close();
  }
});


const validPreference = {
  language:'en',
  answers:{scope:'trust_conditions',motivation:['reality','contribute']},
  comment:'My considered hypothetical preference.',
  consentToStore:true,
  publicConsent:true,
  aggregateConsent:true,
  turnstileToken:'valid-test-token'
};

test('valid preference submission stores only a deletion-token hash and returns one-time token', async t => {
  const db = createPreferencesDb();
  t.mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify({success:true}), {status:200,headers:{'content-type':'application/json'}}));
  const body = validPreference;
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
  assert.equal(stored.public_consent,1);
  assert.deepEqual(JSON.parse(stored.answers_json),body.answers);
});

test('personal response is public when aggregate analysis is declined', async t => {
  const db = createPreferencesDb();
  t.mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify({success:true}), {status:200,headers:{'content-type':'application/json'}}));
  const body = {...validPreference, aggregateConsent:false};
  const response = await worker.fetch(new Request('https://example.test/api/preferences', {
    method:'POST',headers:{'content-type':'application/json','CF-Connecting-IP':'192.0.2.13'},body:JSON.stringify(body)
  }), {PREFERENCES_ENABLED:'true',DB:db,TURNSTILE_SECRET_KEY:'test-secret',RATE_LIMIT_SALT:'test-salt'});
  assert.equal(response.status,200);
  const stored = [...db.records.values()][0];
  assert.equal(stored.aggregate_consent,0);
  assert.equal(stored.public_consent,1);
});

test('deletion token removes the matching preference and unknown token returns same public response', async t => {
  const db = createPreferencesDb();
  t.mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify({success:true}), {status:200,headers:{'content-type':'application/json'}}));
  const body = {...validPreference, aggregateConsent:false};
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
  const repeated = await worker.fetch(deletionRequest(deletionToken),env);
  const unknown = await worker.fetch(deletionRequest('f'.repeat(64)),env);
  assert.equal(deleted.status,200);
  assert.equal(repeated.status,200);
  assert.equal(unknown.status,200);
  assert.deepEqual(await deleted.json(),{ok:true});
  assert.deepEqual(await repeated.json(),{ok:true});
  assert.deepEqual(await unknown.json(),{ok:true});
  assert.equal(db.records.size,0);
});

test('the form can discover saving and deletion only when configured', async () => {
  const configuration = env => worker.fetch(new Request('https://example.test/api/preferences/config'),env);
  const ready = {DB:createPreferencesDb(),RATE_LIMIT_SALT:'test-salt',TURNSTILE_SECRET_KEY:'test-secret'};
  const disabled = await configuration(ready);
  assert.equal(disabled.headers.get('cache-control'),'no-store');
  assert.deepEqual(await disabled.json(),{canSave:false,canDelete:false});
  assert.deepEqual(await (await configuration({PREFERENCES_ENABLED:'true'})).json(),{canSave:false,canDelete:false});
  assert.deepEqual(await (await configuration({...ready,PREFERENCES_ENABLED:'true',TURNSTILE_SECRET_KEY:undefined})).json(),{canSave:false,canDelete:true});
  assert.deepEqual(await (await configuration({...ready,PREFERENCES_ENABLED:'true'})).json(),{canSave:true,canDelete:true});
});

test('preference submission enforces the three-request rate limit per IP', async t => {
  const db = createPreferencesDb();
  t.mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify({success:true}), {status:200,headers:{'content-type':'application/json'}}));
  const body = validPreference;
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

test('preference deletion enforces the ten-request rate limit per IP', async t => {
  const db = createPreferencesDb();
  t.mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify({success:true}), {status:200,headers:{'content-type':'application/json'}}));
  const env = {PREFERENCES_ENABLED:'true',DB:db,TURNSTILE_SECRET_KEY:'test-secret',RATE_LIMIT_SALT:'test-salt'};
  const submitted = await worker.fetch(new Request('https://example.test/api/preferences', {
    method:'POST',
    headers:{'content-type':'application/json','CF-Connecting-IP':'192.0.2.15'},
    body:JSON.stringify(validPreference)
  }),env);
  assert.equal(submitted.status,200);
  const {deletionToken} = await submitted.json();
  const remove = () => worker.fetch(new Request('https://example.test/api/preferences/delete', {
    method:'POST',
    headers:{'content-type':'application/json','CF-Connecting-IP':'192.0.2.16'},
    body:JSON.stringify({deletionToken})
  }),env);

  for (let i=0;i<10;i++) {
    const response = await remove();
    assert.equal(response.status,200);
    assert.deepEqual(await response.json(),{ok:true});
  }
  const limited = await remove();
  assert.equal(limited.status,429);
  assert.deepEqual(await limited.json(),{ok:false,error:'rate_limited'});
});

test('preference submission rejects Turnstile failure without writing data', async t => {
  const db = createPreferencesDb();
  t.mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify({success:false}), {status:200,headers:{'content-type':'application/json'}}));
  const response = await worker.fetch(new Request('https://example.test/api/preferences', {
    method:'POST',headers:{'content-type':'application/json','CF-Connecting-IP':'192.0.2.13'},
    body:JSON.stringify({...validPreference, turnstileToken:'invalid-token'})
  }), {PREFERENCES_ENABLED:'true',DB:db,TURNSTILE_SECRET_KEY:'test-secret',RATE_LIMIT_SALT:'test-salt'});
  assert.equal(response.status,400);
  assert.deepEqual(await response.json(),{ok:false,error:'captcha_failed'});
  assert.equal(db.records.size,0);
});

test('collective response and optional email commit together or roll back together', async t => {
  const db = new DatabaseSync(':memory:');
  t.after(() => db.close());
  db.exec(schema);
  t.mock.method(globalThis, 'fetch', async () => Response.json({success:true}));
  const DB = {
    prepare(sql) {
      const statement=db.prepare(sql);
      let args=[];
      return {
        bind(...values) { args=values; return this; },
        run() { return {meta:statement.run(...args)}; },
        first() { return statement.get(...args); },
        all() { return {results:statement.all(...args)}; }
      };
    },
    batch(statements) {
      db.exec('BEGIN');
      try {
        const results=statements.map(statement => statement.run());
        db.exec('COMMIT');
        return results;
      } catch (error) {
        db.exec('ROLLBACK');
        throw error;
      }
    }
  };
  const submit = participantId => worker.fetch(new Request('https://example.test/api/submit', {
    method:'POST', headers:{'content-type':'application/json'},
    body:JSON.stringify({language:'en',freeAnswer:'A test response with an optional email.',q2:0,q3:0,q4:0,
      authorConfirmed:true,turnstileToken:'test',participantId,feedbackEmail:'test@example.invalid'})
  }), {DB,TURNSTILE_SECRET_KEY:'test',RATE_LIMIT_SALT:'test'});
  db.exec("CREATE TRIGGER reject_contact BEFORE INSERT ON feedback_contacts BEGIN SELECT RAISE(FAIL, 'contact failure'); END");
  assert.equal((await submit(crypto.randomUUID())).status,500);
  assert.equal(db.prepare('SELECT count(*) AS n FROM responses').get().n,0);
  assert.equal(db.prepare('SELECT count(*) AS n FROM feedback_contacts').get().n,0);
  db.exec('DROP TRIGGER reject_contact');
  assert.equal((await submit(crypto.randomUUID())).status,200);
  assert.equal(db.prepare('SELECT count(*) AS n FROM responses').get().n,1);
  assert.equal(db.prepare('SELECT count(*) AS n FROM feedback_contacts').get().n,1);
});

test('retry after a lost confirmation preserves one row per form and recovers the personal deletion token', async t => {
  const db = new DatabaseSync(':memory:');
  t.after(() => db.close());
  db.exec(schema);
  t.mock.method(globalThis, 'fetch', async () => Response.json({success:true}));
  const env = {
    PREFERENCES_ENABLED:'true', TURNSTILE_SECRET_KEY:'test', RATE_LIMIT_SALT:'test',
    DB:{prepare(sql) {
      const statement = db.prepare(sql);
      let args = [];
      return {
        bind(...values) { args = values; return this; },
        run() { return {meta:statement.run(...args)}; },
        first() { return statement.get(...args); },
        all() { return {results:statement.all(...args)}; }
      };
    }}
  };
  const post = (path, data) => worker.fetch(new Request('https://example.test/api/' + path, {
    method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify(data)
  }), env);
  const main = {language:'en',participantId:crypto.randomUUID(),freeAnswer:'Local retry with a valid response.',
    q2:0,q3:0,q4:0,authorConfirmed:true,turnstileToken:'test'};
  assert.equal((await post('submit',main)).status,200);
  const repeatedMain = await post('submit',main);
  assert.equal(repeatedMain.status,409);
  assert.equal((await repeatedMain.json()).error,'already_submitted');
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM responses').get().n,1);

  const personal = {language:'en',submissionKey:crypto.randomUUID(),answers:{scope:'veto',motivation:[]},
    comment:'Original preference for the retry test.',consentToStore:true,publicConsent:true,aggregateConsent:false,turnstileToken:'test'};
  const first = await post('preferences',personal);
  const retry = await post('preferences',personal);
  assert.equal(first.status,200);
  assert.equal(retry.status,200);
  const {deletionToken} = await retry.json();
  assert.equal(deletionToken,(await first.json()).deletionToken);
  const changed = await post('preferences',{...personal,comment:'Changed preference for the retry test.'});
  assert.equal(changed.status,409);
  assert.deepEqual(await changed.json(),{ok:false,error:'submission_changed',deletionToken});
  assert.deepEqual(db.prepare('SELECT comment FROM hypothetical_preferences').all().map(row => row.comment),['Original preference for the retry test.']);
  assert.equal((await post('preferences/delete',{deletionToken})).status,200);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM hypothetical_preferences').get().n,0);
});

test('preference save database failure returns a controlled error and stores no record', async t => {
  const db = createPreferencesDb();
  const originalPrepare = db.prepare.bind(db);
  db.prepare = sql => {
    if (sql.includes('INSERT INTO hypothetical_preferences')) {
      return { bind() { return { run: async () => { throw new Error('simulated database failure'); } }; } };
    }
    return originalPrepare(sql);
  };
  t.mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify({success:true}), {status:200,headers:{'content-type':'application/json'}}));
  const response = await worker.fetch(new Request('https://example.test/api/preferences', {
    method:'POST', headers:{'content-type':'application/json','CF-Connecting-IP':'192.0.2.17'},
    body:JSON.stringify(validPreference)
  }), {PREFERENCES_ENABLED:'true',DB:db,TURNSTILE_SECRET_KEY:'test-secret',RATE_LIMIT_SALT:'test-salt'});
  assert.equal(response.status,500);
  assert.deepEqual(await response.json(),{ok:false,error:'save_failed'});
  assert.equal(db.records.size,0);
});

test('preference deletion database failure returns a controlled error and preserves the record', async t => {
  const db = createPreferencesDb();
  t.mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify({success:true}), {status:200,headers:{'content-type':'application/json'}}));
  const env = {PREFERENCES_ENABLED:'true',DB:db,TURNSTILE_SECRET_KEY:'test-secret',RATE_LIMIT_SALT:'test-salt'};
  const submitted = await worker.fetch(new Request('https://example.test/api/preferences', {
    method:'POST', headers:{'content-type':'application/json','CF-Connecting-IP':'192.0.2.18'},
    body:JSON.stringify(validPreference)
  }),env);
  assert.equal(submitted.status,200);
  const {deletionToken} = await submitted.json();
  const originalPrepare = db.prepare.bind(db);
  db.prepare = sql => {
    if (sql.includes('DELETE FROM hypothetical_preferences WHERE delete_token_hash = ?')) {
      return { bind() { return { run: async () => { throw new Error('simulated database failure'); } }; } };
    }
    return originalPrepare(sql);
  };
  const response = await worker.fetch(new Request('https://example.test/api/preferences/delete', {
    method:'POST', headers:{'content-type':'application/json','CF-Connecting-IP':'192.0.2.19'},
    body:JSON.stringify({deletionToken})
  }),env);
  assert.equal(response.status,503);
  assert.deepEqual(await response.json(),{ok:false,error:'delete_unavailable'});
  assert.equal(db.records.size,1);
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

test('hypothetical preferences requires explicit independent consent choices and validates current questionnaire values', async t => {
  const base = validPreference;
  const db = createPreferencesDb();
  const env = {PREFERENCES_ENABLED:'true', DB:db, TURNSTILE_SECRET_KEY:'test-secret', RATE_LIMIT_SALT:'test-salt'};
  t.mock.method(globalThis, 'fetch', async () => Response.json({success:true}));
  const submit = body => worker.fetch(new Request('https://example.test/api/preferences', {
    method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify(body)
  }), env);
  assert.equal((await submit(base)).status,200);
  for (const body of [
    {...base, consentToStore:undefined},
    {...base, consentToStore:false},
    {...base, consentToStore:true, aggregateConsent:undefined},
    {...base, consentToStore:true, publicConsent:false},
    {...base, consentToStore:true, publicConsent:undefined},
    {...base, consentToStore:true, answers:{...base.answers, unexpected:'value'}},
    {...base, consentToStore:true, answers:{...base.answers, scope:'made-up'}},
    {...base, consentToStore:true, answers:{...base.answers, motivation:['none','reality']}},
    {...base, consentToStore:true, answers:{...base.answers, motivation:['reality','reality']}},
    {...base, consentToStore:true, answers:{...base.answers, motivation:'reality'}}
  ]) {
    const response = await submit(body);
    assert.equal(response.status,400);
    assert.deepEqual(await response.json(),{ok:false,error:'invalid_response'});
  }
  assert.equal(db.records.size,1);
});

test('personal preference reads and AI analysis enforce separate publication and aggregate consent', () => {
  const source = readFileSync(new URL('../src/index.js', import.meta.url), 'utf8');
  assert.match(source, /FROM hypothetical_preferences WHERE public_consent=1 ORDER BY created_at/);
  assert.match(source, /SELECT answers_json,language FROM hypothetical_preferences WHERE aggregate_consent=1/);
  assert.match(source, /FROM hypothetical_preferences WHERE ai_text_consent=1 AND public_consent=1/);
  assert.match(source, /body\.publicConsent!==true/);
  assert.match(source, /const questionKeys=\['scope','motivation','comment'\]/);
  assert.match(source, /questions:\{scope:\{\},motivation:\{\}\}/);
});

test('preferences endpoint rejects oversized request bodies before storage', async t => {
  const db = createPreferencesDb();
  const env = {PREFERENCES_ENABLED:'true', DB:db, TURNSTILE_SECRET_KEY:'test-secret', RATE_LIMIT_SALT:'test-salt'};
  const verify = t.mock.method(globalThis,'fetch',async () => Response.json({success:true}));
  const post = body => worker.fetch(new Request('https://example.test/api/preferences', {
    method:'POST',headers:{'content-type':'application/json'},body
  }), env);
  const payload = JSON.stringify({...validPreference, comment:'語'.repeat(10000)});
  const atLimit = payload + ' '.repeat(70000 - Buffer.byteLength(payload));
  const response = await post(atLimit + ' ');
  assert.equal(response.status,413);
  assert.deepEqual(await response.json(),{ok:false,error:'too_large'});
  assert.equal(verify.mock.callCount(),0);
  assert.equal(db.records.size,0);
  assert.equal((await post(atLimit)).status,200);
  assert.equal(db.records.size,1);
});

test('publication and aggregate consent select independent sets of personal answers', async () => {
  const db = new DatabaseSync(':memory:');
  db.exec(`CREATE TABLE hypothetical_preferences (
    id INTEGER PRIMARY KEY, language TEXT, answers_json TEXT, comment TEXT,
    created_at TEXT, public_consent INTEGER, aggregate_consent INTEGER
  )`);
  const insert = db.prepare('INSERT INTO hypothetical_preferences VALUES (?, ?, ?, ?, ?, ?, ?)');
  for (const [id, publication, aggregate] of [[1,1,0],[2,0,1],[3,1,1],[4,0,0]]) {
    insert.run(id, 'en', JSON.stringify({scope:'none',motivation:[]}), `answer-${id}`, '2026-10-01', publication, aggregate);
  }
  const env = {DB:{prepare(sql){return {all(){return {results:db.prepare(sql).all()};}};}}};
  try {
    const response = await worker.fetch(new Request('https://example.test/api/preferences/public'), env);
    assert.equal(response.status, 200);
    const publicAnswers = await response.json();
    assert.deepEqual(publicAnswers.answers.map(item => item.id).sort(), [1,3]);
    const statsResponse = await worker.fetch(new Request('https://example.test/api/preferences/stats'), env);
    assert.equal(statsResponse.status, 200);
    const {stats} = await statsResponse.json();
    assert.equal(stats.participantTotal, 2);
    assert.equal(stats.unlocked, false);
    assert.deepEqual(stats.languages, {});
    assert.deepEqual(stats.questions, {scope:{},motivation:{}});

    for (let id = 5; id <= 101; id++) {
      insert.run(id, 'en', JSON.stringify({scope:'none',motivation:[]}), `answer-${id}`, '2026-10-01', 0, 1);
    }
    const unlockedResponse = await worker.fetch(new Request('https://example.test/api/preferences/stats'), env);
    assert.equal(unlockedResponse.status, 200);
    const {stats: unlocked} = await unlockedResponse.json();
    assert.equal(unlocked.unlocked, true);
    assert.equal(unlocked.total, 100);
    assert.equal(unlocked.participantTotal, 99);
    assert.equal(unlocked.questions.scope.none, 99);
    assert.equal(unlocked.languages.en, 99);
    const aiResponse = await worker.fetch(new Request('https://example.test/api/ai-analysis', {method:'POST'}), {});
    assert.equal(aiResponse.status, 503);
    assert.deepEqual(await aiResponse.json(), {error:'ai_unavailable'});
  } finally { db.close(); }
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

test('personal answer cards share the results feed header and stable numbering', () => {
  const page = readFileSync(new URL('../public/preferences-results.html', import.meta.url), 'utf8');
  assert.ok(page.includes("const top=node('div',undefined,'answer-card-top')"));
  assert.ok(page.includes("'answer-code'"));
  assert.ok(page.includes('item.answerNumber ?? (Number(item.id)+1)'));
  assert.ok(!page.includes('answer-card-header'));
  const api = readFileSync(new URL('../src/index.js', import.meta.url), 'utf8');
  assert.ok(api.includes('answerNumber:Number(row.answer_number)'));
});

test('personal author answer follows the requested sort order', () => {
  const page = readFileSync(new URL('../public/preferences-results.html', import.meta.url), 'utf8');
  assert.match(page, /let offset = 0, currentPageStart = 0/);
  assert.match(page, /function syncPersonalAuthorAnswerPage\(\)[\s\S]*?const hidden = hasFilter \|\| !authorPage/);
  assert.match(page, /window\.addEventListener\('author-answer-rendered', syncPersonalAuthorAnswerPage\)/);
  assert.match(page, /currentPageStart \+ \(Number\(pageSize.value\) \|\| 20\) >= total/);
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

test('personal preferences consent UI wires Turnstile, save/delete after disclosure, and stays disabled by default', () => {
  const page = readFileSync(new URL('../public/preferences.html', import.meta.url), 'utf8');
  const translations = readFileSync(new URL('../public/preferences-i18n.js', import.meta.url), 'utf8');
  const index = readFileSync(new URL('../src/index.js', import.meta.url), 'utf8');
  assert.match(page, /id="preferences-submission-notice" data-pref-i18n="submissionNotice" hidden/);
  assert.match(page, /id="preferences-saved-confirmation"[^>]*hidden/);
  assert.match(page, /id="deletion-token"[^>]*disabled/);
  assert.match(page, /id="delete-preferences"[^>]*disabled/);
  assert.ok(page.includes('data-pref-i18n="saveDisabled"'));
  for (const lang of ['ru','en','es','pt','de','fr','ja','zh','ar']) {
    const line = translations.split(String.fromCharCode(10)).find(value => value.startsWith(`    ${lang}: {`));
    assert.ok(line, `missing locale ${lang}`);
    for (const key of ['submissionNotice','deleteTitle','deleteDisabled','savedTitle','saveButton','saveError','deleteSuccess']) {
      assert.ok(line.includes(`${key}:`), `missing ${key} in ${lang}`);
    }
  }
  assert.doesNotMatch(page, /<script[^>]+src="https:\/\/challenges\.cloudflare\.com\/turnstile/);
  assert.match(page, /if \(preferencesSavingEnabled\) \{[^}]*turnstileScript\.src = 'https:\/\/challenges\.cloudflare\.com\/turnstile\/v0\/api\.js';/);
  assert.ok(page.includes('data-sitekey="0x4AAAAAAFXnc77nuap7FdMr"'));
  assert.ok(page.includes("fetch('/api/preferences'"));
  assert.ok(page.includes("fetch('/api/preferences/delete'"));
  assert.ok(page.includes('window.onPreferenceTurnstileSuccess'));
  assert.ok(page.includes('let preferencesSavingEnabled = false;'));
  assert.ok(page.includes('let preferencesDeletionEnabled = false;'));
  assert.ok(page.includes("fetch('/api/preferences/config')"));
  assert.ok(page.includes('preferencesSavingEnabled && turnstileToken && selected(\'scope\').length === 1'));
  assert.ok(index.includes("if(env.PREFERENCES_ENABLED!=='true')return json({ok:false,error:'preferences_disabled'},503)"));
  assert.equal(/maxlength="10000"/.test(page.match(/<textarea[^>]*name="comment"[^>]*>/)[0]),true);
});
