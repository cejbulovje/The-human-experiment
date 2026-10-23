import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('Worker keeps frame protection and adds a report-only CSP before enforcement', async () => {
  const source = await readFile(new URL('../src/index.js', import.meta.url), 'utf8');
  assert.match(source, /headers\.set\('content-security-policy',\s*"frame-ancestors 'none'"/);
  assert.match(source, /headers\.set\('content-security-policy-report-only'/);
  assert.match(source, /default-src 'self'/);
  assert.match(source, /object-src 'none'/);
  assert.match(source, /form-action 'self'/);
  assert.match(source, /https:\/\/challenges\.cloudflare\.com/);
  assert.match(source, /script-src 'self' https:\/\/challenges\.cloudflare\.com 'unsafe-inline'/);
  assert.match(source, /style-src 'self' 'unsafe-inline'/);
});
