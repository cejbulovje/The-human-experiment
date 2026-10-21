import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../public/app.js', import.meta.url), 'utf8');
const locales = ['en', 'ru', 'es', 'pt', 'zh', 'de', 'ja', 'fr', 'ar'];
const localePattern = /^  "(en|ru|es|pt|zh|de|ja|fr|ar)": \{/gm;
const starts = [...source.matchAll(localePattern)];

test('all supported locales have a single, complete set of public-disclosure translations', () => {
  assert.equal(starts.length, locales.length, 'translation locale count changed unexpectedly');

  for (let i = 0; i < starts.length; i++) {
    const locale = starts[i][1];
    const start = starts[i].index;
    const end = starts[i + 1]?.index ?? source.indexOf('\n};', start);
    const block = source.slice(start, end);
    assert.ok(locales.includes(locale), `unexpected locale: ${locale}`);

    const keys = [...block.matchAll(/^    "([^"]+)":/gm)].map(match => match[1]);
    const duplicates = keys.filter((key, index) => keys.indexOf(key) !== index);
    assert.deepEqual([...new Set(duplicates)], [], `${locale} contains duplicate translation keys`);

    for (const key of [
      'private-note', 'signature-title', 'signature-help', 'signature-anonymous',
      'signature-signed', 'signature-label', 'signature-placeholder', 'signature-note',
      'author-title', 'author-help', 'author-confirm', 'author-required',
      'signature-required', 'privacy'
    ]) {
      assert.equal(keys.filter(candidate => candidate === key).length, 1,
        `${locale} must define "${key}" exactly once`);
    }
  }
});
