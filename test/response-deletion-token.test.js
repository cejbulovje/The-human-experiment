import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

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
  assert.match(app, /window\.confirm\(responseDeleteText\('confirm'\)\)/);
  assert.match(app, /fetch\('\/api\/response\/delete'/);
  assert.match(html, /id="delete-response-button"/);
  assert.match(html, /id="delete-response-status"/);
});
