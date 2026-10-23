import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';

const schema = readFileSync(new URL('../db/schema.sql', import.meta.url), 'utf8');
const migration6 = readFileSync(new URL('../db/migrations/0006_participant_id.sql', import.meta.url), 'utf8');
const migration7 = readFileSync(new URL('../db/migrations/0007_unique_participant_id.sql', import.meta.url), 'utf8');

test('fresh schema rejects duplicate non-null participant IDs and allows multiple NULL IDs', () => {
  const db = new DatabaseSync(':memory:');
  try {
    db.exec(schema);
    const insert = db.prepare(`INSERT INTO responses (language, free_answer, q2, q3, q4, created_at, participant_id)
      VALUES ('en', ?, 0, 0, 0, '2026-10-24T12:00:00.000Z', ?)`);
    const id = '11111111-1111-4111-8111-111111111111';
    insert.run('First linked answer', id);
    assert.throws(() => insert.run('Duplicate linked answer', id), /UNIQUE constraint failed: responses\\.participant_id/);
    insert.run('First anonymous answer', null);
    insert.run('Second anonymous answer', null);
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM responses WHERE participant_id = ?').get(id).n, 1);
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM responses WHERE participant_id IS NULL').get().n, 2);
  } finally {
    db.close();
  }
});

test('migrations 0006 and 0007 preserve old rows and enforce uniqueness in order', () => {
  const db = new DatabaseSync(':memory:');
  try {
    db.exec(`CREATE TABLE responses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      language TEXT NOT NULL CHECK (language IN ('en','ru')),
      free_answer TEXT NOT NULL,
      q2 INTEGER NOT NULL,
      q3 INTEGER NOT NULL,
      q4 INTEGER NOT NULL,
      gender INTEGER NULL,
      orientation INTEGER NULL,
      created_at TEXT NOT NULL
    );
    INSERT INTO responses (language, free_answer, q2, q3, q4, created_at)
      VALUES ('en', 'Existing answer', 0, 0, 0, '2026-10-20T12:00:00.000Z');`);
    db.exec(migration6);
    db.exec(migration7);
    assert.equal(db.prepare('SELECT participant_id FROM responses WHERE id=1').get().participant_id, null);
    const insert = db.prepare('INSERT INTO responses (language, free_answer, q2, q3, q4, created_at, participant_id) VALUES (\'en\', ?, 0, 0, 0, ?, ?)');
    insert.run('Linked answer', '2026-10-24T12:00:00.000Z', '22222222-2222-4222-8222-222222222222');
    assert.throws(() => insert.run('Duplicate answer', '2026-10-24T12:01:00.000Z', '22222222-2222-4222-8222-222222222222'), /UNIQUE constraint failed/);
    insert.run('Anonymous one', '2026-10-24T12:02:00.000Z', null);
    insert.run('Anonymous two', '2026-10-24T12:03:00.000Z', null);
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM responses WHERE participant_id IS NULL').get().n, 3);
  } finally {
    db.close();
  }
});
