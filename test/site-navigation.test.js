import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const pages = ['index.html', 'goal.html', 'privacy.html', 'results.html'];
const locales = ['en', 'ru', 'es', 'pt', 'zh', 'de', 'ja', 'fr', 'ar'];

test('all public pages load the centered header and compact navigation', () => {
  for (const pageName of pages) {
    const html = readFileSync(new URL('../public/' + pageName, import.meta.url), 'utf8');
    assert.match(html, /class="topbar topbar-centered"/, pageName + ' missing centered header');
    assert.match(html, /class="header-brand-centered"/, pageName + ' missing centered brand');
    assert.match(html, /<script src="\/nav\.js" defer><\/script>/, pageName + ' missing navigation script');
    for (const key of ['goal', 'privacy', 'share', 'survey', 'contact', 'support']) {
      assert.match(html, new RegExp('data-menu="' + key + '"'), pageName + ' missing menu item ' + key);
    }
  }
});

test('shared navigation has labels for all supported locales and implements sharing', () => {
  const script = readFileSync(new URL('../public/nav.js', import.meta.url), 'utf8');
  for (const locale of locales) assert.match(script, new RegExp('^    ' + locale + ': \\{', 'm'), 'missing navigation locale ' + locale);
  assert.match(script, /navigator\.share/);
  assert.match(script, /navigator\.clipboard/);
});
