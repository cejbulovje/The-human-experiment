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

test('locked personal-preference statistics count the author without sharing distributions', async () => {
  const db = createDb([]);
  const response = await worker.fetch(new Request('https://example.test/api/preferences/stats'), {DB:db});
  assert.equal(response.status, 200);
  const {stats} = await response.json();
  assert.equal(stats.total, 1);
  assert.equal(stats.participantTotal, 0);
  assert.equal(stats.unlocked, false);
  assert.equal(stats.remaining, 99);
  assert.equal(stats.authorIncluded, true);
  assert.deepEqual(stats.languages, {});
  assert.deepEqual(stats.questions, {scope:{},motivation:{}});
});

test('personal-preference statistics add the author to participant totals without replacing participant answers', async () => {
  const db = createDb([
    {language:'en', answers_json:JSON.stringify({scope:'veto',motivation:['desires','curiosity']})},
    {language:'ru', answers_json:JSON.stringify({scope:'none',motivation:['reality']})},
    ...Array.from({length:97}, () => ({
      language:'en', answers_json:JSON.stringify({scope:'unlimited',motivation:[]})
    }))
  ]);
  const response = await worker.fetch(new Request('https://example.test/api/preferences/stats'), {DB:db});
  assert.equal(response.status, 200);
  const {stats} = await response.json();
  assert.equal(stats.total, 100);
  assert.equal(stats.participantTotal, 99);
  assert.equal(stats.unlocked, true);
  assert.equal(stats.questions.scope.trust_conditions, 1);
  assert.equal(stats.questions.scope.veto, 1);
  assert.equal(stats.questions.scope.none, 1);
  assert.equal(stats.questions.motivation.reality, 2);
  assert.equal(stats.questions.motivation.similarity, 1);
  assert.equal(stats.questions.motivation.contribute, 1);
  assert.equal(stats.questions.motivation.other, 1);
  assert.equal(stats.questions.motivation.desires, 1);
  assert.equal(stats.questions.motivation.curiosity, 1);
});
