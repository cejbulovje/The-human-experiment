import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

const migration = readFileSync(new URL('../db/migrations/0012_free_answer_10000.sql', import.meta.url), 'utf8');
const schema = readFileSync(new URL('../db/schema.sql', import.meta.url), 'utf8');

test('fresh schema accepts 10,000 characters and rejects 10,001', () => {
  const db = new DatabaseSync(':memory:');
  try {
    db.exec(schema);
    const insert = db.prepare("INSERT INTO responses (language, free_answer, q2, q3, q4, created_at) VALUES ('en', ?, 0, 0, 0, ?)");
    insert.run('x'.repeat(10000), '2026-10-24T12:00:00.000Z');
    assert.throws(() => insert.run('x'.repeat(10001), '2026-10-24T12:01:00.000Z'));
  } finally {
    db.close();
  }
});

test('migration raises the legacy limit and preserves responses, dependent records, and constraints', () => {
  const db = new DatabaseSync(':memory:');
  try {
    // Reproduce the deployed 5,000-character constraint while retaining later schema additions.
    db.exec(schema.replace('BETWEEN 1 AND 10000', 'BETWEEN 1 AND 5000'));
    db.exec('PRAGMA foreign_keys = ON;');

    db.prepare("INSERT INTO responses (id, language, free_answer, q2, q3, q4, created_at, public_id, is_public, answer_number) VALUES (7, 'en', ?, 0, 0, 0, ?, 'existing-public-id', 1, 2)")
      .run('Existing response', '2026-10-24T12:00:00.000Z');
    db.prepare("INSERT INTO response_reactions (response_id, reaction, voter_hash, created_at) VALUES (7, 'interesting', 'voter-hash', ?)")
      .run('2026-10-24T12:01:00.000Z');
    db.prepare("INSERT INTO topic_suggestions (response_id, suggested_topic, voter_hash, created_at) VALUES (7, 'life', 'suggestion-voter', ?)")
      .run('2026-10-24T12:02:00.000Z');

    db.exec(migration);

    const response = db.prepare('SELECT id, free_answer, public_id, answer_number FROM responses WHERE id=7').get();
    assert.deepEqual(Object.values(response), [7, 'Existing response', 'existing-public-id', 2]);
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM response_reactions WHERE response_id=7').get().n, 1);
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM topic_suggestions WHERE response_id=7').get().n, 1);
    const insert = db.prepare("INSERT INTO responses (language, free_answer, q2, q3, q4, created_at) VALUES ('en', ?, 0, 0, 0, ?)");
    insert.run('x'.repeat(10000), '2026-10-24T12:03:00.000Z');
    assert.throws(() => insert.run('x'.repeat(10001), '2026-10-24T12:04:00.000Z'));
    assert.equal(db.prepare('PRAGMA foreign_key_check').all().length, 0);

    const indexes = db.prepare("SELECT name FROM sqlite_master WHERE type='index' AND name LIKE 'idx_responses_%' ORDER BY name").all().map(row => row.name);
    assert.deepEqual(indexes, [
      'idx_responses_answer_number',
      'idx_responses_created_at',
      'idx_responses_language',
      'idx_responses_participant_id_unique',
      'idx_responses_participant_public',
      'idx_responses_public_created',
      'idx_responses_public_id'
    ]);
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM sqlite_master WHERE type='trigger' AND name='assign_public_answer_number'").get().n, 1);
  } finally {
    db.close();
  }
});
