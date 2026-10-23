import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const pages = ['index.html', 'goal.html', 'privacy.html', 'results.html'];
const locales = ['en', 'ru', 'es', 'pt', 'zh', 'de', 'ja', 'fr', 'ar'];

test('all public pages load the centered header and compact navigation', () => {
  for (const pageName of pages) {
    const html = readFileSync(new URL('../public/' + pageName, import.meta.url), 'utf8');
    assert.match(html, /class="topbar topbar-centered"/, pageName + ' missing centered header');
    assert.match(html, /class="brand-lockup header-brand-centered"/, pageName + ' missing centered brand');
    assert.match(html, /<script src="\/nav\.js" defer><\/script>/, pageName + ' missing navigation script');
    for (const key of ['goal', 'privacy', 'results', 'preferences', 'volunteer', 'share', 'survey', 'contact', 'support']) {
      assert.match(html, new RegExp('data-menu="' + key + '"'), pageName + ' missing menu item ' + key);
    }
  }
});

test('homepage prioritizes the survey, then results, and keeps hypothetical preferences secondary', () => {
  const html = readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
  const prompt = html.indexOf('class="prompt"');
  const results = html.indexOf('class="results-teaser"');
  const survey = html.indexOf('<form id="survey-form"');
  const preferences = html.indexOf('class="preferences-cta"');
  assert.ok(prompt >= 0 && prompt < results && results < survey && survey < preferences);
  assert.match(html, /What if the decision were about you\?/);
  assert.match(html, /This is not a volunteer application/);
  assert.doesNotMatch(html, /goal-cta-copy/);
});

test('shared navigation has labels for all supported locales and implements sharing', () => {
  const script = readFileSync(new URL('../public/nav.js', import.meta.url), 'utf8');
  for (const locale of locales) assert.match(script, new RegExp('^    ' + locale + ': \\{', 'm'), 'missing navigation locale ' + locale);
  assert.match(script, /navigator\.share/);
  assert.match(script, /navigator\.clipboard/);
});

test('hypothetical preferences prototype cannot submit a native form or send answers', () => {
  const html = readFileSync(new URL('../public/preferences.html', import.meta.url), 'utf8');
  assert.match(html, /<div id="preferences-form" class="preference-card">/);
  assert.doesNotMatch(html, /<form\b/i);
  assert.doesNotMatch(html, /type="submit"/i);
  assert.doesNotMatch(html, /\bfetch\s*\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage/i);
  assert.match(html, /Ничего не отправлено и не сохранено/);
  assert.match(html, /class="skip-link" href="#main-content"/);
  assert.match(html, /<main id="main-content"/);
  assert.equal((html.match(/role="group" aria-labelledby="preference-question-\d+"/g) || []).length, 5);
  assert.match(html, /<h2 id="preference-question-1">1\. Что было бы для вас главным приоритетом\?<\/h2>/);
  assert.match(html, /\.skip-link:focus\{[^}]*transform:translateY\(0\)/);
  assert.match(html, /form\.querySelector\('textarea\[name="comment"\]'\)\.value\.trim\(\)/);
  assert.doesNotMatch(html, /form\.elements\./);
  assert.equal((html.match(/href="\/preferences\.html"[^>]*aria-current="page"/g) || []).length, 1);
});
