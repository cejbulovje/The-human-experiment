import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/index.js', import.meta.url), 'utf8');

test('AI visitor hashes from previous days are expired without deleting current-day limits', () => {
  assert.match(source, /DELETE FROM ai_daily_visitors WHERE day < \?/);
  assert.match(source, /\.bind\(day\)\.run\(\);\}catch\{\}/);
  assert.match(source, /SELECT 1 AS used FROM ai_daily_visitors WHERE day=\? AND ip_hash=\?/);
  assert.match(source, /INSERT INTO ai_daily_visitors \(day,ip_hash,created_at\) VALUES \(\?,\?,\?\)/);
});
