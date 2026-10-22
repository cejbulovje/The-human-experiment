import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/index.js';

class ResultsDb {
  constructor(total = 0) {
    this.responses = Array.from({ length: total }, (_, index) => ({
      is_public: 1,
      q2: index % 7,
      q3: index % 5,
      q4: index % 7
    }));
    this.snapshot = null;
    this.snapshotWrites = 0;
  }

  prepare(sql) {
    const db = this;
    let args = [];
    const statement = {
      bind(...values) { args = values; return statement; },
      async first() {
        if (sql.includes('SELECT COUNT(*) AS total FROM responses WHERE is_public=1')) {
          return { total: db.responses.filter(row => row.is_public === 1).length };
        }
        if (sql.includes('SELECT published_threshold,total,updated_at,q2,q3,q4,answered FROM public_results_snapshot')) {
          return db.snapshot ? { ...db.snapshot } : null;
        }
        throw new Error(`Unexpected .first() SQL: ${sql}`);
      },
      async all() {
        const match = sql.match(/SELECT (q[234]) AS choice, COUNT\\(\\*\\) AS count FROM responses/);
        if (!match) throw new Error(`Unexpected .all() SQL: ${sql}`);
        const column = match[1];
        const counts = new Map();
        for (const row of db.responses) {
          if (row.is_public !== 1 || row[column] == null) continue;
          counts.set(row[column], (counts.get(row[column]) || 0) + 1);
        }
        return { results: [...counts].map(([choice, count]) => ({ choice, count })) };
      },
      async run() {
        if (!sql.includes('INSERT INTO public_results_snapshot')) {
          throw new Error(`Unexpected .run() SQL: ${sql}`);
        }
        const [published_threshold, total, updated_at, q2, q3, q4, answered] = args;
        if (!db.snapshot || published_threshold > db.snapshot.published_threshold) {
          db.snapshot = {
            id: 1, published_threshold, total, updated_at, q2, q3, q4, answered
          };
          db.snapshotWrites++;
        }
        return { success: true };
      }
    };
    return statement;
  }
}

async function getResults(db) {
  const response = await worker.fetch(
    new Request('https://example.test/api/results'),
    { DB: db }
  );
  return { status: response.status, body: await response.json() };
}

test('results stay locked at 99 public responses', async () => {
  const db = new ResultsDb(99);
  const { status, body } = await getResults(db);
  assert.equal(status, 200);
  assert.deepEqual(body, {
    unlocked: false, total: 99, threshold: 100, remaining: 1, teaser: true
  });
  assert.equal(db.snapshotWrites, 0);
});

test('the 100th response publishes the first snapshot exactly once', async () => {
  const db = new ResultsDb(100);
  const first = await getResults(db);
  assert.equal(first.status, 200);
  assert.equal(first.body.unlocked, true);
  assert.equal(first.body.total, 100);
  assert.equal(first.body.liveTotal, 100);
  assert.equal(first.body.publishedThreshold, 100);
  assert.equal(first.body.nextThreshold, 500);
  assert.equal(db.snapshotWrites, 1);

  const publishedAt = db.snapshot.updated_at;
  const second = await getResults(db);
  assert.equal(second.status, 200);
  assert.equal(second.body.publishedThreshold, 100);
  assert.equal(db.snapshotWrites, 1);
  assert.equal(db.snapshot.updated_at, publishedAt);
});

test('101 responses do not change the published snapshot', async () => {
  const db = new ResultsDb(100);
  await getResults(db);
  const previousSnapshot = { ...db.snapshot };
  db.responses.push({ is_public: 1, q2: 0, q3: 0, q4: 0 });

  const { status, body } = await getResults(db);
  assert.equal(status, 200);
  assert.equal(body.total, 100);
  assert.equal(body.liveTotal, 101);
  assert.equal(body.publishedThreshold, 100);
  assert.equal(db.snapshotWrites, 1);
  assert.deepEqual(db.snapshot, previousSnapshot);
});

test('the 500th response refreshes the snapshot to threshold 500', async () => {
  const db = new ResultsDb(100);
  await getResults(db);
  assert.equal(db.snapshot.published_threshold, 100);

  db.responses.push(...Array.from({ length: 400 }, (_, index) => ({
    is_public: 1,
    q2: index % 7,
    q3: index % 5,
    q4: index % 7
  })));
  const { status, body } = await getResults(db);
  assert.equal(status, 200);
  assert.equal(body.total, 500);
  assert.equal(body.liveTotal, 500);
  assert.equal(body.publishedThreshold, 500);
  assert.equal(body.nextThreshold, 1000);
  assert.equal(db.snapshotWrites, 2);
  assert.equal(db.snapshot.total, 500);
});
