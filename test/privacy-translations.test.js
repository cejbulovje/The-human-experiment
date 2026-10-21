import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const script = readFileSync(new URL('../public/privacy.js', import.meta.url), 'utf8');
const page = readFileSync(new URL('../public/privacy.html', import.meta.url), 'utf8');
const locales = ['en', 'ru', 'es', 'pt', 'zh', 'de', 'ja', 'fr', 'ar'];

test('privacy policy discloses participant grouping in every supported locale', () => {
  for (const locale of locales) {
    const match = script.match(new RegExp('^' + locale + ':\\\\{([^\\\\n]*)', 'm'));
    assert.ok(match, 'missing locale: ' + locale);
    assert.match(match[1], /participantTitle:/, locale + ' missing participant section title');
    assert.match(match[1], /participant:/, locale + ' missing participant disclosure');
  }
  assert.match(page, /data-t="participantTitle"/);
  assert.match(page, /data-t="participant"/);
});
