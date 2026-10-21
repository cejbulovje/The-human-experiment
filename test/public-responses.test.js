import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import worker from '../src/index.js';

function makeEnv() {
  const db = new DatabaseSync(':memory:');
  db.exec(`
    CREATE TABLE responses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      public_id TEXT,
      participant_id TEXT,
      free_answer TEXT NOT NULL,
      language TEXT NOT NULL,
      topic TEXT NOT NULL,
      created_at TEXT NOT NULL,
      q2 INTEGER NOT NULL,
      q3 INTEGER NOT NULL,
      q4 INTEGER NOT NULL,
      q2_other TEXT,
      q3_other TEXT,
      q4_other TEXT,
      gender INTEGER,
      signature TEXT,
      is_public INTEGER NOT NULL DEFAULT 1
    );
    CREATE TABLE response_reactions (
      response_id INTEGER NOT NULL,
      reaction TEXT NOT NULL
    );
    INSERT INTO responses
      (public_id, participant_id, free_answer, language, topic, created_at, q2, q3, q4, is_public)
    VALUES
      ('a-1', '11111111-1111-4111-8111-111111111111', 'I would improve freedom', 'en', 'freedom', '2026-10-01T10:00:00.000Z', 1, 1, 1, 1),
      ('a-2', '11111111-1111-4111-8111-111111111111', 'I would improve relationships', 'en', 'relationships', '2026-10-02T10:00:00.000Z', 1, 1, 1, 1),
      ('b-1', '22222222-2222-4222-8222-222222222222', 'I would change appearance', 'en', 'appearance', '2026-10-03T10:00:00.000Z', 1, 1, 1, 1),
      ('private-1', '11111111-1111-4111-8111-111111111111', 'private hidden freedom', 'en', 'freedom', '2026-10-04T10:00:00.000Z', 1, 1, 1, 0),
      (NULL, NULL, 'Legacy public response', 'en', 'life', '2026-10-05T10:00:00.000Z', 1, 1, 1, 1);
  `);
  const DB = {
    prepare(sql) {
      let values = [];
      return {
        bind(...args) { values = args; return this; },
        first() { return db.prepare(sql).get(...values); },
        all() { return { results: db.prepare(sql).all(...values) }; }
      };
    }
  };
  return { env: { DB }, close: () => db.close() };
}

async function get(url, env) {
  const response = await worker.fetch(new Request('https://example.test' + url), env);
  assert.equal(response.status, 200);
  return response.json();
}

test('public response search combines text, topic and date filters before pagination', async () => {
  const { env, close } = makeEnv();
  try {
    const result = await get('/api/public-responses?q=improve&topic=freedom&from=2026-10-01&to=2026-10-02&limit=1', env);
    assert.equal(result.total, 1);
    assert.equal(result.items.length, 1);
    assert.equal(result.items[0].id, 'a-1');
    assert.equal(result.hasMore, false);
  } finally { close(); }
});

test('participant filter returns only that participant’s public responses', async () => {
  const { env, close } = makeEnv();
  try {
    const result = await get('/api/public-responses?participant=11111111-1111-4111-8111-111111111111&limit=30', env);
    assert.equal(result.total, 2);
    assert.deepEqual(result.items.map(item => item.id), ['a-2', 'a-1']);
    assert.ok(result.items.every(item => item.participantId === '11111111-1111-4111-8111-111111111111'));
  } finally { close(); }
});

test('malformed UUID-shaped participant filter returns no responses', async () => {
  const { env, close } = makeEnv();
  try {
    const result = await get('/api/public-responses?participant=zzzzzzzz-zzzz-4zzz-8zzz-zzzzzzzzzzzz&limit=30', env);
    assert.equal(result.total, 0);
    assert.deepEqual(result.items, []);
  } finally { close(); }
});

test('participant filter accepts uppercase UUIDs', async () => {
  const { env, close } = makeEnv();
  try {
    const result = await get('/api/public-responses?participant=11111111-1111-4111-8111-111111111111'.toUpperCase().replace('HTTPS://EXAMPLE.TEST', ''), env);
    assert.equal(result.total, 2);
    assert.deepEqual(result.items.map(item => item.id), ['a-2', 'a-1']);
  } finally { close(); }
});

test('invalid participant filter returns no responses instead of the full catalog', async () => {
  const { env, close } = makeEnv();
  try {
    const result = await get('/api/public-responses?participant=not-a-valid-id&limit=30', env);
    assert.equal(result.total, 0);
    assert.deepEqual(result.items, []);
  } finally { close(); }
});

test('sort oldest orders responses ascending by creation date', async () => {
  const { env, close } = makeEnv();
  try {
    const result = await get('/api/public-responses?sort=oldest&limit=30', env);
    assert.deepEqual(result.items.map(item => item.id), ['a-1', 'a-2', 'b-1', 'legacy-5']);
  } finally { close(); }
});

test('pagination reports total and hasMore consistently', async () => {
  const { env, close } = makeEnv();
  try {
    const first = await get('/api/public-responses?sort=oldest&limit=2&offset=0', env);
    const second = await get('/api/public-responses?sort=oldest&limit=2&offset=2', env);
    assert.equal(first.total, 4);
    assert.equal(first.items.length, 2);
    assert.equal(first.hasMore, true);
    assert.equal(second.items.length, 2);
    assert.equal(second.hasMore, false);
  } finally { close(); }
});

test('direct links cannot expose a private response', async () => {
  const { env, close } = makeEnv();
  try {
    const result = await get('/api/public-responses?id=private-1&limit=1', env);
    assert.deepEqual(result.items, []);
    assert.equal(result.total, 0);
  } finally { close(); }
});

test('legacy direct links resolve public responses without a public ID', async () => {
  const { env, close } = makeEnv();
  try {
    const result = await get('/api/public-responses?id=legacy-5&limit=1', env);
    assert.equal(result.total, 1);
    assert.equal(result.items[0].id, 'legacy-5');
    assert.equal(result.items[0].answer, 'Legacy public response');
  } finally { close(); }
});

test('nonexistent direct-link ID returns an empty result', async () => {
  const { env, close } = makeEnv();
  try {
    const result = await get('/api/public-responses?id=does-not-exist&limit=1', env);
    assert.deepEqual(result.items, []);
    assert.equal(result.total, 0);
    assert.equal(result.hasMore, false);
  } finally { close(); }
});
