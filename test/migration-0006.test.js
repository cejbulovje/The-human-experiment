import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

const migration = readFileSync(
  new URL('../db/migrations/0006_participant_id.sql', import.meta.url),
  'utf8'
);

test('participant ID migration preserves existing responses and adds an indexed nullable column', () => {
  const db = new DatabaseSync(':memory:');
  try {
    db.exec(`
      CREATE TABLE responses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        free_answer TEXT NOT NULL,
        is_public INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL
      );
      INSERT INTO responses (id, free_answer, is_public, created_at)
      VALUES (9, 'Existing response', 1, '2026-10-20T12:00:00.000Z');
    `);

    db.exec(migration);

    const existing = db.prepare(
      'SELECT id, free_answer, participant_id FROM responses WHERE id=9'
    ).get();
    assert.deepEqual(Object.values(existing), [9, 'Existing response', null]);

    const columns = new Set(
      db.prepare('PRAGMA table_info(responses)').all().map((column) => column.name)
    );
    assert.ok(columns.has('participant_id'));

    const indexes = db.prepare('PRAGMA index_list(responses)').all();
    assert.ok(indexes.some((index) => index.name === 'idx_responses_participant_public'));

    db.prepare(`
      INSERT INTO responses (free_answer, is_public, created_at, participant_id)
      VALUES (?, 1, ?, ?)
    `).run('New response', '2026-10-21T12:00:00.000Z', '11111111-1111-4111-8111-111111111111');

    const inserted = db.prepare(
      'SELECT participant_id FROM responses WHERE free_answer=?'
    ).get('New response');
    assert.equal(inserted.participant_id, '11111111-1111-4111-8111-111111111111');
  } finally {
    db.close();
  }
});
