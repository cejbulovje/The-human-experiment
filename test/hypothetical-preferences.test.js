import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import worker from '../src/index.js';
import { readFileSync } from 'node:fs';

const migration = readFileSync(new URL('../db/migrations/0010_hypothetical_preferences.sql', import.meta.url), 'utf8');
const extensionMigration = readFileSync(new URL('../db/migrations/0012_hypothetical_preferences_public_fields.sql', import.meta.url), 'utf8');
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
  assert.match(extensionMigration, /ALTER TABLE hypothetical_preferences ADD COLUMN comment TEXT/);
  assert.match(extensionMigration, /ALTER TABLE hypothetical_preferences ADD COLUMN public_consent INTEGER NOT NULL DEFAULT 1 CHECK \(public_consent IN \(0,1\)\)/);
});

test('hypothetical preferences migrations preserve existing rows and validate fields', () => {
  const db = new DatabaseSync(':memory:');
  try {
    db.exec(migration);
    const insert = db.prepare('INSERT INTO hypothetical_preferences (language,answers_json,aggregate_consent,delete_token_hash,created_at) VALUES (?,?,?,?,?)');
    insert.run('ru', JSON.stringify({priority:'autonomy',preserve:['identity'],wishes:'ask',body:'consent'}), 1, 'hash-existing', '2026-10-23T00:00:00.000Z');
    db.exec(extensionMigration);
    assert.throws(() => db.exec(extensionMigration), /duplicate column name/i);

    const table = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='hypothetical_preferences'").get();
    assert.equal(table.name, 'hypothetical_preferences');
    const columns = db.prepare("PRAGMA table_info('hypothetical_preferences')").all();
    assert.deepEqual(columns.map(column => column.name), ['id', 'language', 'answers_json', 'aggregate_consent', 'delete_token_hash', 'created_at', 'comment', 'public_consent']);
    assert.equal(columns.find(column => column.name === 'delete_token_hash').notnull, 1);
    assert.equal(columns.find(column => column.name === 'public_consent').notnull, 1);
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM hypothetical_preferences').get().n, 1);
    const preserved = db.prepare('SELECT comment, public_consent FROM hypothetical_preferences WHERE delete_token_hash=?').get('hash-existing');
    assert.equal(preserved.comment, null);
    assert.equal(preserved.public_consent, 1);

    const insertExtended = db.prepare('INSERT INTO hypothetical_preferences (language,answers_json,aggregate_consent,delete_token_hash,created_at,comment,public_consent) VALUES (?,?,?,?,?,?,?)');
    insertExtended.run('en', '{}', 1, 'hash-new', '2026-10-23T00:00:00.000Z', 'example', 1);
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


test('valid preference submission stores only a deletion-token hash and returns one-time token', async t => {
  const db = createPreferencesDb();
  t.mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify({success:true}), {status:200,headers:{'content-type':'application/json'}}));
  const body = {
    language:'en',
    answers:{scope:'trust_conditions',motivation:['reality','contribute']},
    aggregateConsent:true,
    consentToStore:true,
    publicConsent:true,
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
  assert.equal(stored.public_consent,1);
  assert.deepEqual(JSON.parse(stored.answers_json),body.answers);
});

test('personal preference consent choices are stored independently when declined', async t => {
  const db = createPreferencesDb();
  t.mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify({success:true}), {status:200,headers:{'content-type':'application/json'}}));
  const body = {
    language:'en',
    answers:{scope:'trust_conditions',motivation:['reality','contribute']},
    consentToStore:true,
    aggregateConsent:false,
    publicConsent:false,
    turnstileToken:'valid-test-token'
  };
  const response = await worker.fetch(new Request('https://example.test/api/preferences', {
    method:'POST',headers:{'content-type':'application/json','CF-Connecting-IP':'192.0.2.13'},body:JSON.stringify(body)
  }), {PREFERENCES_ENABLED:'true',DB:db,TURNSTILE_SECRET_KEY:'test-secret',RATE_LIMIT_SALT:'test-salt'});
  assert.equal(response.status,200);
  const stored = [...db.records.values()][0];
  assert.equal(stored.aggregate_consent,0);
  assert.equal(stored.public_consent,0);
});

test('deletion token removes the matching preference and unknown token returns same public response', async t => {
  const db = createPreferencesDb();
  t.mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify({success:true}), {status:200,headers:{'content-type':'application/json'}}));
  const body = {
    language:'en',
    answers:{scope:'trust_conditions',motivation:['reality','contribute']},
    aggregateConsent:false,
    consentToStore:true,
    publicConsent:true,
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

test('preference submission enforces the three-request rate limit per IP', async t => {
  const db = createPreferencesDb();
  t.mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify({success:true}), {status:200,headers:{'content-type':'application/json'}}));
  const body = {
    language:'en',
    answers:{scope:'trust_conditions',motivation:['reality','contribute']},
    aggregateConsent:true,
    consentToStore:true,
    publicConsent:true,
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

test('preference deletion enforces the ten-request rate limit per IP', async t => {
  const db = createPreferencesDb();
  t.mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify({success:true}), {status:200,headers:{'content-type':'application/json'}}));
  const env = {PREFERENCES_ENABLED:'true',DB:db,TURNSTILE_SECRET_KEY:'test-secret',RATE_LIMIT_SALT:'test-salt'};
  const submitted = await worker.fetch(new Request('https://example.test/api/preferences', {
    method:'POST',
    headers:{'content-type':'application/json','CF-Connecting-IP':'192.0.2.15'},
    body:JSON.stringify({
      language:'en',
      answers:{scope:'trust_conditions',motivation:['reality','contribute']},
      aggregateConsent:true,
      consentToStore:true,
    publicConsent:true,
      turnstileToken:'valid-test-token'
    })
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
    body:JSON.stringify({language:'en',answers:{scope:'trust_conditions',motivation:['reality','contribute']},aggregateConsent:true,consentToStore:true,
    publicConsent:true,turnstileToken:'invalid-token'})
  }), {PREFERENCES_ENABLED:'true',DB:db,TURNSTILE_SECRET_KEY:'test-secret',RATE_LIMIT_SALT:'test-salt'});
  assert.equal(response.status,400);
  assert.deepEqual(await response.json(),{ok:false,error:'captcha_failed'});
  assert.equal(db.records.size,0);
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
    body:JSON.stringify({
      language:'en',
      answers:{scope:'trust_conditions',motivation:['reality','contribute']},
      aggregateConsent:true, consentToStore:true, publicConsent:true, turnstileToken:'valid-test-token'
    })
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
    body:JSON.stringify({
      language:'en',
      answers:{scope:'trust_conditions',motivation:['reality','contribute']},
      aggregateConsent:true, consentToStore:true, publicConsent:true, turnstileToken:'valid-test-token'
    })
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

test('hypothetical preferences requires explicit independent consent choices and validates current questionnaire values', async () => {
  const base = {
    language:'en',
    answers:{scope:'trust_conditions',motivation:['reality','contribute']},
    aggregateConsent:true,
    publicConsent:true,
    turnstileToken:'token'
  };
  for (const body of [
    base,
    {...base, consentToStore:false},
    {...base, consentToStore:true, aggregateConsent:undefined},
    {...base, consentToStore:true, publicConsent:undefined},
    {...base, consentToStore:true, answers:{...base.answers, unexpected:'value'}},
    {...base, consentToStore:true, answers:{...base.answers, scope:'made-up'}},
    {...base, consentToStore:true, answers:{...base.answers, motivation:['none','reality']}},
    {...base, consentToStore:true, answers:{...base.answers, motivation:['reality','reality']}},
    {...base, consentToStore:true, answers:{...base.answers, motivation:'reality'}}
  ]) {
    const response = await worker.fetch(new Request('https://example.test/api/preferences', {
      method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify(body)
    }), {PREFERENCES_ENABLED:'true', DB:{}, TURNSTILE_SECRET_KEY:'test-secret', RATE_LIMIT_SALT:'test-salt'});
    assert.equal(response.status,400);
    assert.deepEqual(await response.json(),{ok:false,error:'invalid_response'});
  }
});

test('personal preference reads and AI analysis enforce separate publication and aggregate consent', () => {
  const source = readFileSync(new URL('../src/index.js', import.meta.url), 'utf8');
  assert.match(source, /FROM hypothetical_preferences WHERE public_consent=1 ORDER BY created_at/);
  assert.match(source, /SELECT answers_json,language FROM hypothetical_preferences WHERE aggregate_consent=1/);
  assert.match(source, /COUNT\(\*\) AS total FROM hypothetical_preferences WHERE aggregate_consent=1 AND json_type/);
  assert.match(source, /SELECT id,answers_json,language FROM hypothetical_preferences WHERE aggregate_consent=1 AND json_type/);
  assert.match(source, /ai_hypothetical_analysis_memory_consent_v2/);
  assert.match(source, /body\.aggregateConsent\?1:0/);
  assert.match(source, /body\.publicConsent\?1:0/);
  assert.match(source, /const questionKeys=\['scope','motivation'\]/);
  assert.match(source, /questions:\{scope:\{\},motivation:\{\}\}/);
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

test('personal answer cards share the results feed header and stable numbering', () => {
  const page = readFileSync(new URL('../public/preferences-results.html', import.meta.url), 'utf8');
  assert.ok(page.includes("const top=node('div',undefined,'answer-card-top')"));
  assert.ok(page.includes("'answer-code'"));
  assert.ok(page.includes('item.answerNumber ?? (Number(item.id)+1)'));
  assert.ok(!page.includes('answer-card-header'));
  const api = readFileSync(new URL('../src/index.js', import.meta.url), 'utf8');
  assert.ok(api.includes('answerNumber:Number(row.answer_number)'));
});

test('personal author answer is hidden outside the first results page', () => {
  const page = readFileSync(new URL('../public/preferences-results.html', import.meta.url), 'utf8');
  assert.match(page, /let offset = 0, currentPageStart = 0/);
  assert.match(page, /function syncPersonalAuthorAnswerPage\(\)[\s\S]*?const hidden = currentPageStart > 0/);
  assert.match(page, /window\.addEventListener\('author-answer-rendered', syncPersonalAuthorAnswerPage\)/);
  assert.match(page, /currentPageStart=offset; syncPersonalAuthorAnswerPage\(\)/);
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

test('personal preferences consent UI wires Turnstile, consent-gated save/delete, and stays disabled by default', () => {
  const page = readFileSync(new URL('../public/preferences.html', import.meta.url), 'utf8');
  const translations = readFileSync(new URL('../public/preferences-i18n.js', import.meta.url), 'utf8');
  const index = readFileSync(new URL('../src/index.js', import.meta.url), 'utf8');
  for (const id of ['consent-store', 'consent-public', 'consent-aggregate']) assert.ok(page.includes(`id="${id}"`));
  assert.match(page, /id="preferences-saved-confirmation"[^>]*hidden/);
  assert.match(page, /id="deletion-token"[^>]*disabled/);
  assert.match(page, /id="delete-preferences"[^>]*disabled/);
  assert.ok(page.includes('data-pref-i18n="saveDisabled"'));
  for (const lang of ['ru','en','es','pt','de','fr','ja','zh','ar']) {
    const line = translations.split(String.fromCharCode(10)).find(value => value.startsWith(`    ${lang}: {`));
    assert.ok(line, `missing locale ${lang}`);
    for (const key of ['consentStore','consentPublic','consentAggregate','deleteTitle','deleteDisabled','savedTitle','saveButton','savePrompt','saveError','deleteSuccess']) {
      assert.ok(line.includes(`${key}:`), `missing ${key} in ${lang}`);
    }
  }
  assert.ok(page.includes('https://challenges.cloudflare.com/turnstile/v0/api.js'));
  assert.ok(page.includes('data-sitekey="0x4AAAAAAFXnc77nuap7FdMr"'));
  assert.ok(page.includes("fetch('/api/preferences'"));
  assert.ok(page.includes("fetch('/api/preferences/delete'"));
  assert.ok(page.includes('window.onPreferenceTurnstileSuccess'));
  assert.ok(page.includes('const preferencesSavingEnabled = false;'));
  assert.ok(page.includes('preferencesSavingEnabled && turnstileToken'));
  assert.ok(index.includes("if(env.PREFERENCES_ENABLED!=='true')return json({ok:false,error:'preferences_disabled'},503)"));
  assert.ok(index.includes('readJsonLimited(request,12000)'));
});
