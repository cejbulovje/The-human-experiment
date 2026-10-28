import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/index.js';

function createDb(rows=[]) {
  return {
    prepare(sql) {
      const statement = {
        async all() {
          if (sql.includes('SELECT answers_json,language FROM hypothetical_preferences')) return {results: rows};
          throw new Error('Unexpected all SQL: '+sql);
        }
      };
      return statement;
    }
  };
}

test('personal-preference statistics always include the author once and keep their choices in this stream', async () => {
  const db = createDb([]);
  const response = await worker.fetch(new Request('https://example.test/api/preferences/stats'), {DB:db});
  assert.equal(response.status, 200);
  const {stats} = await response.json();
  assert.equal(stats.total, 1);
  assert.equal(stats.participantTotal, 0);
  assert.equal(stats.unlocked, false);
  assert.equal(stats.remaining, 99);
  assert.equal(stats.questions.scope.trust_conditions, 1);
  assert.equal(stats.questions.motivation.reality, 1);
  assert.equal(stats.questions.motivation.similarity, 1);
  assert.equal(stats.questions.motivation.contribute, 1);
  assert.equal(stats.questions.motivation.other, 1);
});

test('personal-preference statistics add the author to participant totals without replacing participant answers', async () => {
  const db = createDb([
    {language:'en', answers_json:JSON.stringify({scope:'veto',motivation:['desires','curiosity']})},
    {language:'ru', answers_json:JSON.stringify({scope:'none',motivation:['reality']})}
  ]);
  const response = await worker.fetch(new Request('https://example.test/api/preferences/stats'), {DB:db});
  assert.equal(response.status, 200);
  const {stats} = await response.json();
  assert.equal(stats.total, 3);
  assert.equal(stats.participantTotal, 2);
  assert.equal(stats.questions.scope.trust_conditions, 1);
  assert.equal(stats.questions.scope.veto, 1);
  assert.equal(stats.questions.scope.none, 1);
  assert.equal(stats.questions.motivation.reality, 2);
  assert.equal(stats.questions.motivation.desires, 1);
  assert.equal(stats.questions.motivation.curiosity, 1);
});
