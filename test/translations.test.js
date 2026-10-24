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
      'signature-required', 'privacy',
      'feedback-title', 'feedback-help', 'feedback-opt-in-label',
      'feedback-email-label', 'feedback-email-placeholder', 'feedback-email-note'
    ]) {
      assert.equal(keys.filter(candidate => candidate === key).length, 1,
        `${locale} must define "${key}" exactly once`);
    }
  }
});

test('results page translates every shared dynamic label for all non-English locales', () => {
  const results = readFileSync(new URL('../public/results.js', import.meta.url), 'utf8');
  const start = results.indexOf('const RESULTS_EXTRA_UI = {');
  const end = results.indexOf('\n};', start);
  assert.ok(start >= 0 && end > start, 'results-specific translation map must exist');
  const block = results.slice(start, end);
  const requiredKeys = [
    'otherDetail', 'loading', 'topicLabel', 'fromLabel', 'toLabel', 'sortLabel',
    'reactions', 'date', 'ctx2', 'ctx3', 'ctx4', 'statsLocked', 'statsOpen'
  ];
  for (const locale of ['es', 'pt', 'zh', 'de', 'ja', 'fr', 'ar']) {
    const line = block.split('\n').find(candidate => candidate.trimStart().startsWith(locale + ': {'));
    assert.ok(line, 'missing results translations for ' + locale);
    for (const key of requiredKeys) {
      assert.match(line, new RegExp('\\b' + key + ':'), locale + ' missing results translation ' + key);
    }
  }
});

test('language switching still applies translations when localStorage is unavailable', () => {
  const localized = readFileSync(new URL('../public/preferences-i18n.js', import.meta.url), 'utf8');
  assert.match(localized, /select\.addEventListener\('change',[\s\S]*?try \{ localStorage\.setItem\(sharedKey, select\.value\); \} catch \{\}[\s\S]*?apply\(\);/);
});

test('results date-filter accessibility labels follow the selected locale', () => {
  const results = readFileSync(new URL('../public/results.js', import.meta.url), 'utf8');
  assert.match(results, /\$\('#date-from'\)\?\.setAttribute\('aria-label',words\.fromLabel\)/);
  assert.match(results, /\$\('#date-to'\)\?\.setAttribute\('aria-label',words\.toLabel\)/);
});

test('Arabic hypothetical-preferences labels do not say default preferences', () => {
  const app = readFileSync(new URL('../public/app.js', import.meta.url), 'utf8');
  const results = readFileSync(new URL('../public/results.js', import.meta.url), 'utf8');
  const preferences = readFileSync(new URL('../public/preferences-i18n.js', import.meta.url), 'utf8');
  for (const [name, source] of [['homepage', app], ['results', results], ['preferences page', preferences]]) {
    assert.doesNotMatch(source, /التفضيلات الافتراضية/, name + ' contains outdated Arabic wording');
  }
  assert.match(app, /استكشف التفضيلات المفترضة/);
  assert.match(preferences, /title:'التفضيلات المفترضة - THE HUMAN EXPERIMENT'/);
  assert.match(preferences, /voiceCard:'التفضيلات المفترضة'/);
});

test('every homepage translation key and placeholder exists in all nine locales', () => {
  const html = readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
  const app = readFileSync(new URL('../public/app.js', import.meta.url), 'utf8');
  const keys = [...new Set([...html.matchAll(/data-i18n="([^"]+)"/g)].map(match => match[1]))];
  const placeholders = [...new Set([...html.matchAll(/data-i18n-placeholder="([^"]+)"/g)].map(match => match[1]))];
  for (const key of keys) {
    assert.equal((app.match(new RegExp('"' + key + '":', 'g')) || []).length, locales.length,
      'homepage translation "' + key + '" must exist in every locale');
  }
  for (const key of placeholders) {
    assert.equal((app.match(new RegExp('"' + key + '":', 'g')) || []).length, locales.length,
      'homepage placeholder "' + key + '" must exist in every locale');
  }
});
