import test from 'node:test';
import assert from 'node:assert/strict';
import { parseOtherAnswers, readJsonLimited } from '../src/index.js';

const base = { q2: 0, q3: 0, q4: 0 };

test('accepts ordinary choices when Other details are omitted', () => {
  assert.deepEqual(parseOtherAnswers(base), {
    q2Other: null, q3Other: null, q4Other: null
  });
});

test('requires a non-empty detail for each selected Other choice', () => {
  assert.equal(parseOtherAnswers({ ...base, q2: 6 }), null);
  assert.equal(parseOtherAnswers({ ...base, q3: 4 }), null);
  assert.equal(parseOtherAnswers({ ...base, q4: 6 }), null);
});

test('trims and preserves details for the matching Other choices', () => {
  assert.deepEqual(parseOtherAnswers({
    q2: 6, q2Other: '  my answer  ',
    q3: 4, q3Other: ' another answer ',
    q4: 6, q4Other: ' final answer '
  }), {
    q2Other: 'my answer',
    q3Other: 'another answer',
    q4Other: 'final answer'
  });
});

test('rejects detail text when its matching Other choice is not selected', () => {
  assert.equal(parseOtherAnswers({ ...base, q2Other: 'not selected' }), null);
  assert.equal(parseOtherAnswers({ ...base, q3Other: 'not selected' }), null);
  assert.equal(parseOtherAnswers({ ...base, q4Other: 'not selected' }), null);
});

test('enforces the 500-character limit and rejects whitespace-only details', () => {
  assert.equal(parseOtherAnswers({ ...base, q2: 6, q2Other: 'x'.repeat(500) }).q2Other.length, 500);
  assert.equal(parseOtherAnswers({ ...base, q2: 6, q2Other: 'x'.repeat(501) }), null);
  assert.equal(parseOtherAnswers({ ...base, q2: 6, q2Other: '   ' }), null);
});

test('rejects missing or non-object request bodies', () => {
  assert.equal(parseOtherAnswers(null), null);
  assert.equal(parseOtherAnswers('not an object'), null);
});

test('bounded JSON parser accepts valid JSON without Content-Length', async () => {
  const request = new Request('https://example.test/api', {
    method: 'POST',
    body: JSON.stringify({ answer: 'hello' })
  });
  assert.deepEqual(await readJsonLimited(request, 100), { body: { answer: 'hello' } });
});

test('bounded JSON parser rejects oversized streamed bodies', async () => {
  const request = new Request('https://example.test/api', {
    method: 'POST',
    body: JSON.stringify({ answer: 'x'.repeat(100) })
  });
  assert.deepEqual(await readJsonLimited(request, 20), { error: 'too_large' });
});

test('bounded JSON parser rejects malformed JSON', async () => {
  const request = new Request('https://example.test/api', {
    method: 'POST',
    body: '{not-json'
  });
  assert.deepEqual(await readJsonLimited(request, 100), { error: 'invalid_json' });
});
