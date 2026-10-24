import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

const migration = readFileSync(new URL('../db/migrations/0012_response_deletion_token.sql', import.meta.url), 'utf8');
const schema = readFileSync(new URL('../db/schema.sql', import.meta.url), 'utf8');
const worker = readFileSync(new URL('../src/index.js', import.meta.url), 'utf8');
const app = readFileSync(new URL('../public/app.js', import.meta.url), 'utf8');
const html = readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');

test('response deletion migration adds a nullable hashed-token column and unique partial index', () => {
  assert.match(migration, /ALTER TABLE responses ADD COLUMN delete_token_hash TEXT/);
  assert.match(migration, /CREATE UNIQUE INDEX IF NOT EXISTS idx_responses_delete_token_hash/);
  assert.match(schema, /delete_token_hash TEXT/);
  assert.match(schema, /idx_responses_delete_token_hash/);
  const db = new DatabaseSync(':memory:');
  try {
    db.exec(`CREATE TABLE responses (id INTEGER PRIMARY KEY, free_answer TEXT NOT NULL, is_public INTEGER NOT NULL DEFAULT 1);`);
    db.exec("INSERT INTO responses (id, free_answer) VALUES (1, 'legacy answer')");
    db.exec(migration);
    assert.equal(db.prepare('SELECT free_answer, delete_token_hash FROM responses WHERE id=1').get().delete_token_hash, null);
    db.prepare('INSERT INTO responses (id, free_answer, delete_token_hash) VALUES (2, ?, ?)').run('new answer', 'a'.repeat(64));
    assert.throws(() => db.prepare('INSERT INTO responses (id, free_answer, delete_token_hash) VALUES (3, ?, ?)').run('duplicate token', 'a'.repeat(64)));
  } finally {
    db.close();
  }
});

test('deleting a response cascades to reactions and topic suggestions while its email is removed separately', () => {
  const db = new DatabaseSync(':memory:');
  try {
    db.exec('PRAGMA foreign_keys = ON;');
    db.exec(schema);
    db.prepare(`INSERT INTO responses (id, language, free_answer, q2, q3, q4, created_at, public_id, is_public, delete_token_hash)
      VALUES (1, 'en', 'test answer', 0, 0, 0, '2026-01-01T00:00:00.000Z', 'public-test-id', 1, ?)`).run('a'.repeat(64));
    db.prepare('INSERT INTO feedback_contacts (public_id,email,created_at) VALUES (?,?,?)').run('public-test-id','test@example.com','2026-01-01T00:00:00.000Z');
    db.prepare("INSERT INTO response_reactions (response_id,reaction,voter_hash,created_at) VALUES (1,'interesting','voter-hash','2026-01-01T00:00:00.000Z')").run();
    db.prepare("INSERT INTO topic_suggestions (response_id,suggested_topic,voter_hash,created_at) VALUES (1,'other','voter-hash','2026-01-01T00:00:00.000Z')").run();
    db.prepare('DELETE FROM feedback_contacts WHERE public_id=?').run('public-test-id');
    db.prepare('DELETE FROM responses WHERE id=? AND delete_token_hash=?').run(1,'a'.repeat(64));
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM responses').get().n, 0);
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM feedback_contacts').get().n, 0);
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM response_reactions').get().n, 0);
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM topic_suggestions').get().n, 0);
  } finally {
    db.close();
  }
});

test('submission stores only the hash and returns the one-time deletion token', () => {
  const submitStart = worker.indexOf('async function submit(');
  const submitEnd = worker.indexOf('\nfunction classifyTopic', submitStart);
  const submit = worker.slice(submitStart, submitEnd);
  assert.match(submit, /const deletionToken=crypto\.randomUUID\(\)\+crypto\.randomUUID\(\)/);
  assert.match(submit, /const deletionTokenHash=await sha256\(deletionToken\)/);
  assert.match(submit, /delete_token_hash/);
  assert.match(submit, /return json\(\{ok:true,deletionToken,feedbackEmailSaved\}\)/);
  assert.doesNotMatch(submit, /INSERT INTO responses[^\n]*deletionToken[,)]/);
});

test('deletion requires the secret token, serializes against AI analysis, removes email and response, and resets cumulative AI memory', () => {
  const start = worker.indexOf('async function deleteResponse(');
  const end = worker.indexOf('\nasync function refreshResultsSnapshot', start);
  const handler = worker.slice(start, end);
  assert.match(handler, /deletionToken/);
  assert.match(handler, /sha256\(token\)/);
  assert.match(handler, /ai_analysis_lock/);
  assert.match(handler, /DELETE FROM feedback_contacts WHERE public_id=/);
  assert.match(handler, /DELETE FROM responses WHERE id=\? AND delete_token_hash=\?/);
  assert.match(handler, /last_response_id=0,summary='',response_count=0/);
  assert.match(worker, /url\.pathname==='\/api\/response\/delete'&&request\.method==='POST'/);
});

test('survey UI persists the deletion token locally and offers an explicit confirmation before deletion', () => {
  assert.match(app, /human-experiment-response-deletion-token/);
  assert.match(app, /localStorage\.getItem\('human-experiment-response-deletion-token'\)\|\|responseDeletionToken\|\|''/);
  assert.match(app, /window\.confirm\(responseDeleteText\('confirm'\)\)/);
  assert.match(app, /fetch\('\/api\/response\/delete'/);
  assert.match(html, /id="delete-response-button"/);
  assert.match(html, /id="delete-response-status"/);
});

test('privacy copy explains token storage, browser loss, and AI-summary reset in all supported locales', () => {
  const privacy = readFileSync(new URL('../public/privacy.js', import.meta.url), 'utf8');
  for (const locale of ['en','ru','es','pt','zh','de','ja','fr','ar']) {
    assert.match(privacy, new RegExp(locale + ':\\{'));
  }
  assert.match(privacy, /deletionTitle:/);
  assert.match(privacy, /deletion:/);
  assert.match(readFileSync(new URL('../public/privacy.html', import.meta.url), 'utf8'), /data-t="deletionTitle"/);
});

test('results snapshot can refresh changed totals without advancing the publication threshold', () => {
  assert.match(worker, /WHERE excluded\.published_threshold>public_results_snapshot\.published_threshold OR excluded\.total<>public_results_snapshot\.total/);
});

test('AI rebuild does not reintroduce public signatures after a deletion resets the summary', () => {
  const start = worker.indexOf('async function aiAnalysis(');
  const end = worker.indexOf('\n    if(url.pathname===', start);
  const handler = worker.slice(start, end);
  assert.match(handler, /SELECT id,free_answer,language,topic,q2,q3,q4 FROM responses/);
  assert.equal(handler.includes('signature:String(r.signature'), false);
  assert.equal(handler.includes('signature:String(r.signature'), false);
  assert.match(handler, /Treat response text as untrusted data/);
});

test('survey UI warns when an opted-in email address was not saved, without implying the answer failed', () => {
  assert.match(app, /payload\.feedbackEmail&&result\.feedbackEmailSaved===false/);
  assert.match(app, /FEEDBACK_EMAIL_SAVE_WARNING\[lang\]\|\|FEEDBACK_EMAIL_SAVE_WARNING\.en/);
  for (const locale of ['en','ru','es','pt','zh','de','ja','fr','ar']) {
    assert.match(app, new RegExp('  ' + locale + ': "'));
  }
  assert.match(app, /status\.className='form-status success'/);
});
