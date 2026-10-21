import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const script = readFileSync(new URL('../public/privacy.js', import.meta.url), 'utf8');
const page = readFileSync(new URL('../public/privacy.html', import.meta.url), 'utf8');
const locales = ['en', 'ru', 'es', 'pt', 'zh', 'de', 'ja', 'fr', 'ar'];

test('privacy policy discloses participant grouping in every supported locale', () => {
  for (const locale of locales) {
    const start = script.indexOf(locale + ':{');
    assert.notEqual(start, -1, 'missing locale: ' + locale);
    const end = script.indexOf('\n', start);
    const line = script.slice(start, end === -1 ? undefined : end);
    assert.match(line, /participantTitle:/, locale + ' missing participant section title');
    assert.match(line, /participant:/, locale + ' missing participant disclosure');
  }
  assert.match(page, /data-t="participantTitle"/);
  assert.match(page, /data-t="participant"/);
});
