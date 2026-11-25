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

test('main survey can read the Turnstile token from its hidden response field', () => {
  const app = readFileSync(new URL('../public/app.js', import.meta.url), 'utf8');
  assert.match(app, /function getTurnstileResponse\(\)\s*\{\s*if \(turnstileToken\) return turnstileToken;\s*const responseField = form\.querySelector\('\[name="cf-turnstile-response"\]'\);/);
  assert.match(app, /const captchaResponse = getTurnstileResponse\(\);[\s\S]*?if\(!captchaResponse\)[\s\S]*?turnstileToken:captchaResponse/);
});

test('homepage offers both roles after the introduction and before results and the form', () => {
  const html = readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
  const intro = html.indexOf('id="localized-intro-copy"');
  const roles = html.indexOf('class="role-paths"');
  const results = html.indexOf('class="results-teaser"');
  const survey = html.indexOf('<form id="survey-form"');
  assert.ok(intro >= 0 && intro < roles && roles < results && results < survey);

  const cards = html.slice(roles, results);
  assert.equal((cards.match(/class="role-card"/g) || []).length, 2);
  assert.match(cards, /class="role-action" href="#survey-form"/);
  assert.match(cards, /class="role-action" href="\/preferences\.html" aria-describedby="preferences-preview"/);
  assert.match(cards, /id="preferences-preview"[^>]*>Your answers can be saved and published only with your consent/);
  assert.match(html, /<form id="survey-form"[^>]*tabindex="-1" aria-labelledby="survey-question"/);
});

test('mobile header reserves space for controls and exposes keyboard focus', () => {
  const css = readFileSync(new URL('../public/styles.css', import.meta.url), 'utf8');
  assert.match(css, /\.site-menu-trigger:focus-visible\{[^}]*outline:3px solid/);
  assert.match(css, /@media\(max-width:760px\)\s*\{\s*\.topbar-centered\{[^}]*grid-template-columns:44px minmax\(0,1fr\) 44px/);
  assert.match(css, /\.topbar-centered \.header-controls\{\s*grid-column:1 \/ -1;\s*grid-row:2;/);
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
  assert.match(css, /\.topbar-centered \.header-controls\{\s*margin-inline-start:auto;/);
  assert.match(css, /text-align:start/);
  assert.match(css, /padding-inline-start:22px/);
  assert.doesNotMatch(css, /text-align:left/);
});


test('hypothetical preferences does not submit a native form and starts with saving disabled', () => {
  const html = readFileSync(new URL('../public/preferences.html', import.meta.url), 'utf8');
  assert.match(html, /<div id="preferences-form" class="preference-card">/);
  assert.doesNotMatch(html, /<form\b/i);
  assert.doesNotMatch(html, /type="submit"/i);
  assert.match(html, /let preferencesSavingEnabled = false;/);
  assert.match(html, /Сводка остаётся на открытой странице/);
  assert.match(html, /class="skip-link" href="#main-content"/);
  assert.match(html, /<main id="main-content"/);
  assert.equal((html.match(/class="preference-question"/g) || []).length, 3);
  assert.match(html, /<h2 id="preference-question-1">1\. [^<]+<\/h2>/);
  assert.match(html, /\.skip-link:focus\{[^}]*transform:translateY\(0\)/);
  assert.match(html, /const comment = commentField\.value\.trim\(\)/);
  assert.doesNotMatch(html, /form\.elements\./);
  assert.doesNotMatch(html, /preference-question-6|name="use"/);
  assert.doesNotMatch(html, /id="consent-(?:store|public|ai-text)"/);
  assert.match(html, /aria-describedby="preferences-submission-notice"/);
  assert.match(html, /consentToStore:true,publicConsent:true,aggregateConsent:true,aiTextConsent:true/);
  assert.match(html, /id="preferences-preview-note"[^>]*>Эта пробная форма не отправляет и не сохраняет ответы\./);

  assert.equal((html.match(/href="\/preferences\.html"[^>]*aria-current="page"/g) || []).length, 1);
});


test('research prototype page avoids recruitment language and signup pathways', () => {
  const html = readFileSync(new URL('../public/volunteers-voice.html', import.meta.url), 'utf8');
  assert.match(html, /Теперь человек, которого они могут изменить, - вы/);
  assert.match(html, /только в воображаемой ситуации/);
  assert.doesNotMatch(html, /<form\b|href="[^"]*(?:signup|register)/i);
  assert.match(html, /Гипотетические предпочтения/);
  assert.match(html, /Пробная форма\.|пробная форма\./);
  assert.match(html, /Написанное останется на открытой странице/);
});


test('public navigation does not recruit volunteers', () => {
  const files = ['index.html', 'preferences.html', 'results.html', 'volunteers-voice.html'];
  for (const name of files) {
    const html = readFileSync(new URL('../public/' + name, import.meta.url), 'utf8');
    const previewRoleLink = /<a class="role-action" href="\/preferences\.html" aria-describedby="preferences-preview" data-i18n="preferences-link">[^<]+<\/a>/;
    const navigation = name === 'index.html' ? html.replace(previewRoleLink, '') : html;
    const controls = [...navigation.matchAll(/<(?:a|button)\b[^>]*>([\s\S]*?)<\/(?:a|button)>/g)].map(match => match[1]).join(' ');
    assert.doesNotMatch(controls, /добровол|volunteer|voluntário|voluntario|volontaire|freiwillig|ボランティア|志愿者|متطوع/i, name + ' contains recruitment terminology');
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
  assert.match(localized, /window\.preferenceLocale = q/);
});

test('hypothetical preferences keeps an unsent summary and requires server opt-in to save', () => {
  const html = readFileSync(new URL('../public/preferences.html', import.meta.url), 'utf8');
  assert.match(html, /const locale = window\.preferenceLocale/);
  assert.match(html, /locale\.summaryLabels/);
  assert.match(html, /preferencesSavingEnabled = config\?\.canSave === true/);
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
  assert.match(html, /const previewOnly = \['localhost','127\.0\.0\.1','\[::1\]'\]\.includes\(location\.hostname\)[\s\S]*?get\('demo'\) === '101'/, 'synthetic personal answers require local explicit demo mode');
  assert.match(html, /const total=Number\(data\.stats\.total\|\|0\);\s*const participants=Number\(data\.stats\.participantTotal\|\|0\);\s*stats\.textContent=interpolate\(apiUi\(\)\.stats,\{total,participants\}\);[\s\S]*?if\(totalNode\) totalNode\.textContent=String\(participants\)/, 'personal statistics keep participant and author totals separate');
  assert.doesNotMatch(html, /id="hypothetical-answer-list"/, 'no fake second feed is presented as live data');
  for (const locale of locales) {
    for (const key of ['resultsTitle','resultsIntro','resultsCount','emptyTitle','emptyText','emptyNext']) {
      assert.match(script, new RegExp('"' + key + '":'), 'missing localized hypothetical results key ' + key);
    }
  }
});


test('both answer streams expose backward and forward history navigation and newest-first defaults', () => {
  const collectiveHtml = readFileSync(new URL('../public/results.html', import.meta.url), 'utf8');
  const personalHtml = readFileSync(new URL('../public/preferences-results.html', import.meta.url), 'utf8');
  const results = readFileSync(new URL('../public/results.js', import.meta.url), 'utf8');
  const preview = readFileSync(new URL('../public/preferences-results-preview.js', import.meta.url), 'utf8');
  assert.match(collectiveHtml, /id="answers-previous"/);
  assert.match(collectiveHtml, /id="show-more"/);
  assert.match(results, /const sort=params.get\('sort'\)\|\|'newest'/);
  assert.match(results, /loadAnswers\(true,Math\.max\(0,currentPageStart-pageSize\)\)/, 'previous navigation returns to the prior page start');
  assert.match(results, /loadAnswers\(true,offset\)/);
  assert.match(personalHtml, /id="hypothetical-sort".*?value="latest" selected/);
  assert.match(personalHtml, /id='hypothetical-load-previous'/);
  assert.match(personalHtml, /id='hypothetical-load-more'/);
  assert.match(preview, /fillPersonalPage\(Math\.max\(0, Number\(document\.querySelector\('\.hypothetical-answer-list'\)\?\.dataset\.testSamplesPage \|\| 0\) - 1\)\)/);
});


test('personal preview sample cards remain isolated to the personal results page', () => {
  const resultsHtml = readFileSync(new URL('../public/results.html', import.meta.url), 'utf8');
  const personalHtml = readFileSync(new URL('../public/preferences-results.html', import.meta.url), 'utf8');
  const preview = readFileSync(new URL('../public/preferences-results-preview.js', import.meta.url), 'utf8');
  assert.doesNotMatch(resultsHtml, /src="\/preferences-results-preview\.js"/);
  assert.doesNotMatch(resultsHtml, /id="hypothetical-load-(?:previous|more)"/);
  assert.match(personalHtml, /src="\/preferences-results-preview\.js"/);
  assert.match(preview, /card\.className = 'answer-card preview-sample-answer'/);
  assert.match(preview, /card\.id = 'sample-answer-' \+ kind \+ '-' \+ index/);
  assert.match(preview, /card\.append\(top, freeTextQuestion, preview, toggle, full, choices, actions\)/);
  const results = readFileSync(new URL('../public/results.js', import.meta.url), 'utf8');
  assert.match(results, /const demoSamples=\[/, 'collective demo answers use questionnaire-aligned examples');
  assert.match(results, /context:\{q2:sample\.q2,q3:sample\.q3,q4:sample\.q4\}/, 'demo choice context uses the selected questionnaire options');
  assert.doesNotMatch(results, /context:\{q2:'life',q3:'relationships',q4:'freedom'\}/, 'demo context must not show internal topic IDs as questionnaire answers');
  assert.match(results, /const isLastPage=currentPageStart\+pageSize>=answerTotal/);
  assert.match(results, /if\(!showAuthor\).*card\.hidden=true/);
});


test('author answer shows a substantial preview before its expandable full text', () => {
  const answers = readFileSync(new URL('../public/author-answers.js', import.meta.url), 'utf8');
  assert.match(answers, /const intro = paragraphs\.join\('\\n\\n'\)\.trim\(\)/);
  assert.match(answers, /const previewLimit = 1200;/);
  assert.match(answers, /toggle\.addEventListener\('click'/);
});

test('preview result samples use one real paginated renderer in both streams', () => {
  const html = readFileSync(new URL('../public/results.html', import.meta.url), 'utf8');
  const results = readFileSync(new URL('../public/results.js', import.meta.url), 'utf8');
  const personal = readFileSync(new URL('../public/preferences-results-preview.js', import.meta.url), 'utf8');
  assert.doesNotMatch(html, /demo-collective-load-more|demo-hypothetical-load-more/, 'legacy append-only demo controls are removed');
  assert.match(results, /const DEMO_MODE=\['localhost','127\.0\.0\.1','\[::1\]'\]\.includes\(location\.hostname\)&&new URL\(location\.href\)\.searchParams\.get\('demo'\)==='101'/, 'demo answers require a local host and explicit demo query');
  assert.match(results, /all\.slice\(requestOffset,requestOffset\+pageSize\)/, 'collective cards are sliced to one page');
  assert.match(personal, /const query = \(document\.getElementById\('hypothetical-search'\)/, 'personal search filters sample cards');
  assert.match(personal, /const question = document\.getElementById\('hypothetical-question-filter'\)/, 'personal question filter is applied');
  assert.match(personal, /const orderedSamples = sort === 'latest' \? matching\.slice\(\)\.reverse\(\) : matching/);
  assert.match(personal, /search\?\.addEventListener\('input'/);
  assert.match(personal, /question\?\.addEventListener\('change'/);
  assert.match(personal, /const next = Math\.min\(orderedSamples\.length, shown \+ pageSize\)/, 'personal cards are sliced to one page');
});


test('dedicated personal results page opens on the answer feed instead of the overview', () => {
  const html = readFileSync(new URL('../public/preferences-results.html', import.meta.url), 'utf8');
  assert.match(html, /class="results-view-tab is-active" data-results-view="all"/);
  assert.doesNotMatch(html, /class="results-view-tab is-active" data-results-view="overview"/);
  assert.match(html, /let view = 'all';/);
  assert.match(html, /if \(hypotheticalEmpty\) \{[\s\S]*?hypotheticalEmpty\.hidden = view === 'overview';/);
});

test('collective author answer remains visible while public statistics are locked', () => {
  const results = readFileSync(new URL('../public/results.js', import.meta.url), 'utf8');
  assert.match(results, /const unlocked=root\?\.dataset\.resultsUnlocked==='true'\|\|CREATOR_PREVIEW/);
  assert.match(results, /if\(!root\|\|!list\)return;const card=root\.querySelector\('\.author-answer-card'\)/);
  assert.match(results, /if\(!showAuthor\).*card\.hidden=true/);
  assert.doesNotMatch(results, /if\(!unlocked\|\|!root\)return/);
});

test('personal preview initializes even when loaded after DOMContentLoaded', () => {
  const personal = readFileSync(new URL('../public/preferences-results-preview.js', import.meta.url), 'utf8');
  assert.match(personal, /if \(document\.readyState === 'loading'\) \{[\s\S]*?document\.addEventListener\('DOMContentLoaded', initializePreview, \{ once: true \}\);[\s\S]*?\} else \{\s*initializePreview\(\);\s*\}/);
  assert.match(personal, /function initializePreview\(\) \{\s*fillPersonalPage\(0\);/);
});


test('personal results page shares the top-level stream switcher and does not start collective API loading', () => {
  const personal = readFileSync(new URL('../public/preferences-results.html', import.meta.url), 'utf8');
  const results = readFileSync(new URL('../public/results.js', import.meta.url), 'utf8');
  const navStart = personal.indexOf('class="results-stream-links preference-page-switcher"');
  const nav = personal.slice(navStart, personal.indexOf('</nav>', navStart));
  assert.match(nav, /href="\/results\.html" data-results-stream="collective"/);
  assert.match(nav, /href="\/preferences-results\.html" data-results-stream="hypothetical" aria-current="page"/);
  assert.equal((personal.match(/class="results-stream-links preference-page-switcher"/g) || []).length, 1, 'switcher appears once at the top of the personal page');
  assert.match(results, /const PERSONAL_RESULTS_PAGE=\/\^\\\/preferences-results/);
  assert.match(results, /if\(!PERSONAL_RESULTS_PAGE\)\{loadStats\(\);/);
  assert.match(personal, /#results-status, #statistics-section/);
});

test('all public result paths reject demo data even with the demo query', () => {
  const gate = "['localhost','127.0.0.1','[::1]'].includes(location.hostname)";
  for (const file of ['results.js','results.html','preferences-results.html','preferences-results-preview.js','results-releases.js']) {
    const source = readFileSync(new URL('../public/' + file, import.meta.url), 'utf8');
    assert.ok(source.includes(gate), file + ' must restrict demos to local hosts');
  }
});
