import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';

const schema = readFileSync(new URL('../db/schema.sql', import.meta.url), 'utf8');

test('prototype schema enforces unique non-null participant IDs and allows multiple NULL IDs', () => {
  const db = new DatabaseSync(':memory:');
  try {
    db.exec(schema);

    const insert = db.prepare(`
      INSERT INTO responses (language, free_answer, q2, q3, q4, created_at, participant_id)
      VALUES ('en', ?, 0, 0, 0, ?, ?)
    `);
    const participantId = '11111111-1111-4111-8111-111111111111';

    insert.run('First linked response', '2026-10-24T12:00:00.000Z', participantId);
    assert.throws(
      () => insert.run('Duplicate linked response', '2026-10-24T12:01:00.000Z', participantId),
      error => String(error.message).includes('UNIQUE constraint failed: responses.participant_id')
    );

    insert.run('Anonymous response one', '2026-10-24T12:02:00.000Z', null);
    insert.run('Anonymous response two', '2026-10-24T12:03:00.000Z', null);

    assert.equal(
      db.prepare('SELECT COUNT(*) AS n FROM responses WHERE participant_id = ?').get(participantId).n,
      1
    );
    assert.equal(
      db.prepare('SELECT COUNT(*) AS n FROM responses WHERE participant_id IS NULL').get().n,
      2
    );
  } finally {
    db.close();
  }
});
