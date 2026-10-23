import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';

const schema = readFileSync(new URL('../db/schema.sql', import.meta.url), 'utf8');
const insert = `INSERT INTO responses
  (language, free_answer, q2, q3, q4, q2_other, q3_other, q4_other, gender,
   created_at, public_id, is_public, topic, signature, participant_id)
  SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?
  WHERE ? IS NULL OR NOT EXISTS (
    SELECT 1 FROM responses WHERE participant_id = ?
  )`;

function save(db, participantId, answer, publicId) {
  return db.prepare(insert).run(
    'en', answer, 0, 0, 0, null, null, null, null,
    '2026-10-23T20:00:00.000Z', publicId, 'other', null,
    participantId, participantId, participantId
  );
}

test('the conditional insert rejects a second response with the same participant ID', () => {
  const db = new DatabaseSync(':memory:');
  try {
    db.exec(schema);
    const participantId = '11111111-1111-4111-8111-111111111111';
    const first = save(db, participantId, 'First response', 'public-first');
    const second = save(db, participantId, 'Second response', 'public-second');

    assert.equal(Number(first.changes), 1);
    assert.equal(Number(second.changes), 0);
    assert.equal(
      db.prepare('SELECT COUNT(*) AS total FROM responses WHERE participant_id = ?').get(participantId).total,
      1
    );
  } finally {
    db.close();
  }
});

test('the conditional insert allows responses without a valid participant ID', () => {
  const db = new DatabaseSync(':memory:');
  try {
    db.exec(schema);
    assert.equal(Number(save(db, null, 'First anonymous response', 'public-anon-1').changes), 1);
    assert.equal(Number(save(db, null, 'Second anonymous response', 'public-anon-2').changes), 1);
    assert.equal(db.prepare('SELECT COUNT(*) AS total FROM responses').get().total, 2);
  } finally {
    db.close();
  }
});
