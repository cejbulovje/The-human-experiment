import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const pages = ['index.html', 'goal.html', 'privacy.html', 'results.html', 'preferences.html', 'volunteers-voice.html'];
const locales = ['en', 'ru', 'es', 'pt', 'zh', 'de', 'ja', 'fr', 'ar'];

test('all public pages load the centered header and compact navigation', () => {
  for (const pageName of pages) {
    const html = readFileSync(new URL('../public/' + pageName, import.meta.url), 'utf8');
    assert.match(html, /class="topbar topbar-centered"/, pageName + ' missing centered header');
    assert.match(html, /class="brand-lockup header-brand-centered"/, pageName + ' missing centered brand');
    assert.match(html, /<script src="\/nav\.js" defer><\/script>/, pageName + ' missing navigation script');
    const requiredMenuKeys = ['goal', 'privacy', 'results', 'preferences', 'share', 'survey', 'contact', 'support'];
    for (const key of requiredMenuKeys) {
      assert.match(html, new RegExp('data-menu="' + key + '"'), pageName + ' missing menu item ' + key);
    }
  }
});

test('homepage prioritizes the survey, then results, and keeps hypothetical preferences secondary', () => {
  const html = readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
  const prompt = html.indexOf('class="prompt"');
  const primary = html.indexOf('class="primary-survey-cta"');
  const results = html.indexOf('class="results-teaser"');
  const survey = html.indexOf('<form id="survey-form"');
  const preferences = html.indexOf('class="preferences-cta"');
  assert.ok(prompt >= 0 && prompt < primary && primary < results && results < survey && survey < preferences);
  assert.match(html, /What if the decision were about you\?/);
  assert.match(html, /This is a research prototype; no answers are sent or saved/);
  assert.doesNotMatch(html, /class="goal-cta"/);
  assert.doesNotMatch(html, /goal-cta-copy/);
  for (const key of ['preferences-eyebrow', 'preferences-title', 'preferences-copy', 'preferences-link']) {
    assert.match(html, new RegExp('data-i18n="' + key + '"'), 'missing localized preferences CTA key ' + key);
  }
});

test('hypothetical preferences CTA is translated in every supported language', () => {
  const app = readFileSync(new URL('../public/app.js', import.meta.url), 'utf8');
  for (const key of ['preferences-eyebrow', 'preferences-title', 'preferences-copy', 'preferences-link']) {
    assert.equal((app.match(new RegExp('"' + key + '"\\s*:', 'g')) || []).length, locales.length, key + ' must exist in all supported locales');
  }
});

test('mobile header reserves space for controls and exposes keyboard focus', () => {
  const css = readFileSync(new URL('../public/styles.css', import.meta.url), 'utf8');
  assert.match(css, /\.site-menu-trigger:focus-visible\{[^}]*outline:3px solid/);
  assert.match(css, /@media\(max-width:600px\)[\s\S]*?grid-template-columns:36px minmax\(0,1fr\) auto/);
  assert.match(css, /@media\(max-width:370px\)[\s\S]*?grid-template-columns:34px minmax\(0,1fr\) 74px/);
});

test('shared navigation has labels for all supported locales and implements sharing', () => {
  const script = readFileSync(new URL('../public/nav.js', import.meta.url), 'utf8');
  for (const locale of locales) assert.match(script, new RegExp('^    ' + locale + ': \\{', 'm'), 'missing navigation locale ' + locale);
  assert.match(script, /const openShareDialog = \(\) =>/);
  assert.match(script, /data-share-service="whatsapp"/);
  assert.match(script, /data-share-service="copy"/);
  assert.match(script, /navigator\.clipboard/);
  assert.equal((script.match(/\blanguage:/g) || []).length, locales.length, 'language selector accessibility label must be translated in every locale');
  assert.match(script, /languagePicker\.setAttribute\('aria-label', t\.language\)/);
  assert.match(script, /querySelectorAll\('\.brand-lockup'\)[\s\S]*?setAttribute\('aria-label', t\.home\)/);
  assert.match(script, /querySelectorAll\('\.footer-links\[aria-label\]'\)[\s\S]*?setAttribute\('aria-label', t\.projectLinks\)/);
  for (const key of ['language', 'home', 'projectLinks']) {
    assert.equal((script.match(new RegExp('\\b' + key + ':', 'g')) || []).length, locales.length, key + ' must be translated in all locales');
  }
  for (const key of ['emailCopied', 'emailCopyFailed', 'copyEmail']) {
    assert.equal((script.match(new RegExp('\\b' + key + ':', 'g')) || []).length, locales.length, key + ' must be translated in all supported locales');
  }
  assert.match(script, /menu\.setAttribute\('aria-label', t\.menu\)/);
});

test('every main page marks exactly one current navigation destination', () => {
  const currentByPage = {
    'index.html': '/', 'goal.html': '/goal.html', 'privacy.html': '/privacy.html',
    'results.html': '/results.html', 'preferences.html': '/preferences.html',
    'volunteers-voice.html': '/volunteers-voice.html'
  };
  delete currentByPage['volunteers-voice.html']; // This prototype page intentionally has no duplicate self-link in the compact menu.
  for (const [pageName, href] of Object.entries(currentByPage)) {
    const html = readFileSync(new URL('../public/' + pageName, import.meta.url), 'utf8');
    const current = [...html.matchAll(/<a\b[^>]*aria-current="page"[^>]*>/g)].map(match => match[0]);
    assert.equal(current.length, 1, pageName + ' must have exactly one current navigation link');
    assert.ok(current[0].includes('href="' + href + '"'), pageName + ' current link must point to this page');
  }
});

test('site menu controls meet minimum touch-target dimensions', () => {
  const css = readFileSync(new URL('../public/styles.css', import.meta.url), 'utf8');
  assert.match(css, /\.site-menu-trigger\{[^}]*min-width:44px;min-height:44px/);
  assert.match(css, /\.site-menu-panel a,[\s\S]*?\.site-menu-panel button\{min-height:44px;display:flex;align-items:center\}/);
});

test('RTL layout uses direction-aware CSS for navigation and text alignment', () => {
  const css = readFileSync(new URL('../public/styles.css', import.meta.url), 'utf8');
  assert.match(css, /\.site-menu-panel\{position:absolute;inset-inline-start:0;/);
  assert.match(css, /\.topbar-centered \.header-controls\{margin-inline-start:auto;/);
  assert.match(css, /text-align:start/);
  assert.match(css, /padding-inline-start:22px/);
  assert.doesNotMatch(css, /text-align:left/);
});


test('hypothetical preferences prototype cannot submit a native form or send answers', () => {
  const html = readFileSync(new URL('../public/preferences.html', import.meta.url), 'utf8');
  assert.match(html, /<div id="preferences-form" class="preference-card">/);
  assert.doesNotMatch(html, /<form\b/i);
  assert.doesNotMatch(html, /type="submit"/i);
  assert.match(html, /const preferencesSavingEnabled = false;/);
  assert.match(html, /Ничего не отправлено и не сохранено/);
  assert.match(html, /class="skip-link" href="#main-content"/);
  assert.match(html, /<main id="main-content"/);
  assert.equal((html.match(/class="preference-question"/g) || []).length, 3);
  assert.match(html, /<h2 id="preference-question-1">1\. Что бы ты позволил человечеству изменить в себе\?<\/h2>/);
  assert.match(html, /\.skip-link:focus\{[^}]*transform:translateY\(0\)/);
  assert.match(html, /const comment = commentField\.value\.trim\(\)/);
  assert.doesNotMatch(html, /form\.elements\./);
  assert.doesNotMatch(html, /preference-question-6|name="use"/);
  assert.match(html, /id="consent-store" name="consentToStore"/);
  assert.match(html, /id="consent-public" name="publicConsent"/);
  assert.match(html, /id="consent-aggregate" name="aggregateConsent"/);
  assert.match(html, /Сейчас это прототип: ответы остаются в этом окне, не отправляются и не сохраняются/);

  assert.equal((html.match(/href="\/preferences\.html"[^>]*aria-current="page"/g) || []).length, 1);
});


test('research prototype page avoids recruitment language and signup pathways', () => {
  const html = readFileSync(new URL('../public/volunteers-voice.html', import.meta.url), 'utf8');
  assert.doesNotMatch(html.replaceAll('/volunteers-voice.html', ''), /добровол|volunteer|voluntário|voluntario|volontaire|freiwillig|ボランティア|志愿者|متطوع/i);
  assert.match(html, /Гипотетические предпочтения/);
  assert.match(html, /Сейчас мы проверяем вопросы и исследовательскую идею/);
});


test('public-facing research copy does not use volunteer terminology', () => {
  const files = ['index.html', 'preferences.html', 'results.html', 'volunteers-voice.html'];
  for (const name of files) {
    const html = readFileSync(new URL('../public/' + name, import.meta.url), 'utf8');
    assert.doesNotMatch(html.replaceAll('/volunteers-voice.html', ''), /добровол|volunteer|voluntário|voluntario|volontaire|freiwillig|ボランティア|志愿者|متطوع/i, name + ' contains recruitment terminology');
  }
  const nav = readFileSync(new URL('../public/nav.js', import.meta.url), 'utf8');
  assert.doesNotMatch(nav, /добровол|volunteer|voluntário|voluntario|volontaire|freiwillig|ボランティア|志愿者|متطوع/i);
});


test('both hypothetical preference pages provide all nine shared language choices and localization', () => {
  const localized = readFileSync(new URL('../public/preferences-i18n.js', import.meta.url), 'utf8');
  for (const pageName of ['preferences.html', 'volunteers-voice.html']) {
    const html = readFileSync(new URL('../public/' + pageName, import.meta.url), 'utf8');
    assert.match(html, /<select id="page-language" aria-label="Language">/);
    for (const locale of locales) assert.match(html, new RegExp('<option value="' + locale + '">'));
    assert.match(html, /<script src="\/preferences-i18n\.js" defer><\/script>/);
  }
  for (const locale of locales) {
    assert.match(localized, new RegExp('^    ' + locale + ': \\{', 'm'), 'missing page localization for ' + locale);
  }
  for (const key of ['heading','lead','questions','priority','preserve','wishes','body','show','reset','summaryLabels','voiceHeading','voiceLead','bullets','statusBody']) {
    assert.match(localized, new RegExp('\\b' + key + ':'), 'missing localization key ' + key);
  }
  assert.match(localized, /human-experiment-language/);
  assert.match(localized, /localStorage\.setItem\(sharedKey, select\.value\)/);
  assert.match(localized, /document\.documentElement\.dir = t\.dir/);
  assert.match(localized, /window\.preferenceLocale = t/);
});

test('hypothetical preference pages keep answers local and summary labels translatable', () => {
  const html = readFileSync(new URL('../public/preferences.html', import.meta.url), 'utf8');
  assert.match(html, /const locale = window\.preferenceLocale/);
  assert.match(html, /locale\.summaryLabels/);
  assert.match(html, /const preferencesSavingEnabled = false;/);
  assert.match(html, /preferencesSavingEnabled && turnstileToken/);
});


test('results page has one footer destination for preferences and clear methodology labeling', () => {
  const html = readFileSync(new URL('../public/results.html', import.meta.url), 'utf8');
  const script = readFileSync(new URL('../public/results.js', import.meta.url), 'utf8');
  assert.equal(html.split('href="/methodology.html"').length - 1, 2, 'content and footer each link to methodology');
  assert.doesNotMatch(html, /href="\/volunteers-voice\.html">Hypothetical preferences/);
  assert.match(script, /ГИПОТЕТИЧЕСКИЕ ПРЕДПОЧТЕНИЯ/);
  assert.match(script, /Будущее исследование:/);
  assert.match(html, /data-voice="resultsTitle"/);
  assert.match(html, /data-voice="emptyText"/);
  assert.doesNotMatch(script, /ГОЛОС ДОБРОВОЛЬЦА|О голосе добровольца/);
});


test('results page separates collective answers from hypothetical preference answers without fabricating data', () => {
  const html = readFileSync(new URL('../public/results.html', import.meta.url), 'utf8');
  const script = readFileSync(new URL('../public/results.js', import.meta.url), 'utf8');
  assert.match(html, /id="answer-list"/, 'main collective response feed remains intact');
  assert.match(html, /aria-labelledby="preference-results-title"/, 'separate hypothetical answers section exists');
  assert.match(html, /class="status-panel hypothetical-empty-state"/);
  assert.match(html, /data-voice="emptyText"/);
  assert.match(html, /data-voice="emptyNext"/);
  assert.doesNotMatch(html, /id="hypothetical-answer-list"/, 'no fake second feed is presented as live data');
  for (const locale of locales) {
    for (const key of ['resultsTitle','resultsIntro','resultsCount','emptyTitle','emptyText','emptyNext']) {
      assert.match(script, new RegExp('"' + key + '":'), 'missing localized hypothetical results key ' + key);
    }
  }
});


test('both answer streams expose backward and forward history navigation and oldest-first defaults', () => {
  const collectiveHtml = readFileSync(new URL('../public/results.html', import.meta.url), 'utf8');
  const personalHtml = readFileSync(new URL('../public/preferences-results.html', import.meta.url), 'utf8');
  const results = readFileSync(new URL('../public/results.js', import.meta.url), 'utf8');
  const preview = readFileSync(new URL('../public/preferences-results-preview.js', import.meta.url), 'utf8');
  assert.match(collectiveHtml, /id="answers-previous"/);
  assert.match(collectiveHtml, /id="show-more"/);
  assert.match(results, /const sort=params.get\('sort'\)\|\|'oldest'/);
  assert.match(results, /loadAnswers\(true,Math\.max\(0,offset-pageSize\)\)/);
  assert.match(results, /loadAnswers\(true,offset\)/);
  assert.match(personalHtml, /id="hypothetical-sort".*?value="oldest" selected/);
  assert.match(personalHtml, /id='hypothetical-load-previous'/);
  assert.match(personalHtml, /id='hypothetical-load-more'/);
  assert.match(preview, /fillPersonalPage\(Math\.max\(0, Number\(document\.querySelector\('\.hypothetical-answer-list'\)\?\.dataset\.testSamplesPage \|\| 0\) - 1\)\)/);
});


test('combined Results demo renders personal sample cards with participant styling and pagination', () => {
  const resultsHtml = readFileSync(new URL('../public/results.html', import.meta.url), 'utf8');
  const personalHtml = readFileSync(new URL('../public/preferences-results.html', import.meta.url), 'utf8');
  const preview = readFileSync(new URL('../public/preferences-results-preview.js', import.meta.url), 'utf8');
  assert.match(resultsHtml, /src="\/preferences-results-preview\.js"/);
  assert.match(resultsHtml, /id="hypothetical-load-previous"/);
  assert.match(resultsHtml, /id="hypothetical-load-more"/);
  assert.match(personalHtml, /src="\/preferences-results-preview\.js"/);
  assert.match(preview, /location\.pathname === '\/results\.html'.*demo.*101/);
  assert.match(preview, /card\.className = 'answer-card preview-sample-answer'/);
  assert.match(preview, /card\.id = 'sample-answer-' \+ kind \+ '-' \+ index/);
  assert.match(preview, /card\.append\(top, freeTextQuestion, preview, toggle, full, choices, actions\)/);
  const results = readFileSync(new URL('../public/results.js', import.meta.url), 'utf8');
  assert.match(results, /demoItems\('collective'\)\.filter\(item=>item\.answerNumber!==1\)/);
  assert.match(results, /if\(currentPageStart>0\).*author-answer-card/);
});


test('preview result samples use one real paginated renderer in both streams', () => {
  const html = readFileSync(new URL('../public/results.html', import.meta.url), 'utf8');
  const results = readFileSync(new URL('../public/results.js', import.meta.url), 'utf8');
  const personal = readFileSync(new URL('../public/preferences-results-preview.js', import.meta.url), 'utf8');
  assert.doesNotMatch(html, /demo-collective-load-more|demo-hypothetical-load-more/, 'legacy append-only demo controls are removed');
  assert.match(results, /const DEMO_MODE=.*CREATOR_PREVIEW.*\['\/results','\/results\.html'\]/, 'collective preview uses its normal page navigation on the preview route');
  assert.match(results, /all\.slice\(requestOffset,requestOffset\+pageSize\)/, 'collective cards are sliced to one page');
  assert.match(personal, /const query = \(document\.getElementById\('hypothetical-search'\)/, 'personal search filters sample cards');
  assert.match(personal, /const question = document\.getElementById\('hypothetical-question-filter'\)/, 'personal question filter is applied');
  assert.match(personal, /const orderedSamples = sort === 'latest' \? matching\.slice\(\)\.reverse\(\) : matching/);
  assert.match(personal, /search\?\.addEventListener\('input'/);
  assert.match(personal, /question\?\.addEventListener\('change'/);
  assert.match(personal, /const next = Math\.min\(orderedSamples\.length, shown \+ pageSize\)/, 'personal cards are sliced to one page');
});


test('dedicated personal results page opens the answer feed and hides collective loading state', () => {
  const personalHtml = readFileSync(new URL('../public/preferences-results.html', import.meta.url), 'utf8');
  assert.match(personalHtml, /#results-status[^}]*display:none !important/, 'collective loading status must not remain visible on the personal page');
  assert.ok(personalHtml.includes(String.raw`let view = ['/preferences-results.html', '/preferences-results'].includes(location.pathname.replace(/\/$/, '')) ? 'all' : 'overview';`), 'personal results should open directly to answers on both .html and extensionless routes');
});
