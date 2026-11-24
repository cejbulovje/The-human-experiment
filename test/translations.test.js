import test from 'node:test';
import { runInNewContext } from 'node:vm';
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
      'private-note-title', 'private-note', 'author-title', 'author-help', 'author-confirm', 'author-required', 'privacy',
      'feedback-title', 'feedback-help', 'feedback-opt-in-label',
      'feedback-email-label', 'feedback-email-placeholder', 'feedback-email-note',
      'other-placeholder', 'other-help', 'already-submitted'
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
    'otherDetail', 'loading', 'searchLabel', 'topicLabel', 'fromLabel', 'toLabel', 'sortLabel',
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

test('Spanish and Portuguese anti-bot instructions use corrected wording', () => {
  const app = readFileSync(new URL('../public/app.js', import.meta.url), 'utf8');
  assert.match(app, /"captcha-note": "Completa la verificación anti-bot para enviar tu respuesta\."/);
  assert.match(app, /"captcha-note": "Conclua a verificação anti-bot para enviar sua resposta\."/);
  assert.doesNotMatch(app, /verificación ant bots|verificação ant robôs/);
});


test('English and Russian results search labels are translated', () => {
  const results = readFileSync(new URL('../public/results.js', import.meta.url), 'utf8');
  assert.match(results, /en:\{[^\n]*searchLabel:'Search answers'/);
  assert.match(results, /ru:\{[^\n]*searchLabel:'Поиск по ответам'/);
});

test('changing results language rebuilds the translated question filter', () => {
  const results = readFileSync(new URL('../public/results.js', import.meta.url), 'utf8');
  assert.match(results, /applyLanguage\(\);populateQuestionFilter\(\);loadAnswers\(true\);/);
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

test('results-page AI and hypothetical-preferences dictionaries are complete in every locale', () => {
  const results = readFileSync(new URL('../public/results.js', import.meta.url), 'utf8');
  const html = readFileSync(new URL('../public/results.html', import.meta.url), 'utf8');
  for (const dictionaryName of ['OPEN_DATA_UI', 'AI_ANALYSIS_UI', 'PREFERENCE_RESEARCH_UI']) {
    const line = results.split('\n').find(candidate => candidate.startsWith('const ' + dictionaryName + '='));
    assert.ok(line, dictionaryName + ' dictionary must exist');
    const dictionary = JSON.parse(JSON.stringify(runInNewContext(line + ';' + dictionaryName)));
    assert.deepEqual(Object.keys(dictionary).sort(), [...locales].sort(), dictionaryName + ' must define all nine locales');
    const keys = Object.keys(dictionary.en);
    for (const locale of locales) {
      assert.deepEqual(Object.keys(dictionary[locale]).sort(), [...keys].sort(),
        dictionaryName + ' keys must match English for ' + locale);
    }
  }
  const aiKeys = new Set(Object.keys(JSON.parse(results.split('\n').find(line => line.startsWith('const AI_ANALYSIS_UI=')).slice('const AI_ANALYSIS_UI='.length).trim().replace(/;$/, '')).en));
  const preferenceKeys = new Set(Object.keys(JSON.parse(results.split('\n').find(line => line.startsWith('const PREFERENCE_RESEARCH_UI=')).slice('const PREFERENCE_RESEARCH_UI='.length).trim().replace(/;$/, '')).en));
  for (const key of new Set([...html.matchAll(/data-ai(?:-placeholder)?="([^"]+)"/g)].map(match => match[1]))) {
    assert.ok(aiKeys.has(key), 'missing AI results translation key: ' + key);
  }
  for (const key of new Set([...html.matchAll(/data-voice="([^"]+)"/g)].map(match => match[1]))) {
    assert.ok(preferenceKeys.has(key), 'missing hypothetical-preferences translation key: ' + key);
  }
});

test('goal and privacy page text keys exist in every locale', () => {
  const pages = [
    {script: 'goal.js', html: 'goal.html'},
    {script: 'privacy.js', html: 'privacy.html'}
  ];
  for (const page of pages) {
    const source = readFileSync(new URL('../public/' + page.script, import.meta.url), 'utf8');
    const html = readFileSync(new URL('../public/' + page.html, import.meta.url), 'utf8');
    const requiredKeys = [...new Set([...html.matchAll(/data-t="([^"]+)"/g)].map(match => match[1]))];
    const starts = [...source.matchAll(/^\s{0,2}(en|ru|es|pt|zh|de|ja|fr|ar):\s*\{/gm)];
    assert.equal(starts.length, locales.length, page.script + ' must define all nine locales');
    for (let i = 0; i < starts.length; i++) {
      const locale = starts[i][1];
      const block = source.slice(starts[i].index, starts[i + 1]?.index ?? source.length);
      for (const key of requiredKeys) {
        assert.match(block, new RegExp('\\b' + key + ':'), page.script + ' missing ' + key + ' for ' + locale);
      }
    }
  }
});

test('hypothetical-preferences page defines all translation fields for every locale', () => {
  const source = readFileSync(new URL('../public/preferences-i18n.js', import.meta.url), 'utf8');
  const localeSource = source.slice(0, source.indexOf('  const sharedKey'));
  const starts = [...localeSource.matchAll(/^\s{4}(ru|en|es|pt|zh|de|ja|fr|ar): \{/gm)];
  assert.equal(starts.length, locales.length, 'preferences page must define all nine locales');
  const requiredKeys = [
    'name', 'dir', 'title', 'skip', 'resultLink', 'eyebrow', 'heading', 'lead', 'tag',
    'noticeTitle', 'notice', 'previewNotice', 'consent', 'questions', 'helpers', 'priority', 'preserve',
    'wishes', 'body', 'placeholder', 'privacy', 'show', 'reset', 'summaryTitle', 'status',
    'statusText', 'notSaved', 'edit', 'results', 'summaryLabels', 'voiceEyebrow',
    'voiceHeading', 'voiceLead', 'banner', 'voiceCard', 'voiceText', 'voiceText2',
    'goQuestions', 'researchTitle', 'bullets', 'statusTitle', 'statusBody', 'statusBody2',
    'toResults', 'toSurvey'
  ];
  for (let i = 0; i < starts.length; i++) {
    const locale = starts[i][1];
    const block = source.slice(starts[i].index, starts[i + 1]?.index ?? source.length);
    for (const key of requiredKeys) {
      assert.match(block, new RegExp('\\b' + key + ':'), 'preferences page missing ' + key + ' for ' + locale);
    }
  }
  const arabic = source.match(/^\s{4}ar: \{([^\n]*)/m)?.[1] || '';
  assert.match(arabic, /dir:'rtl'/, 'Arabic preferences page must use right-to-left direction');
});

test('all public pages respect browser language preferences and Arabic RTL', () => {
  const scripts = ['app.js', 'goal.js', 'privacy.js', 'results.js', 'preferences-i18n.js'];
  for (const filename of scripts) {
    const source = readFileSync(new URL('../public/' + filename, import.meta.url), 'utf8');
    assert.match(source, /navigator\.languages/, filename + ' must inspect browser language preferences');
    assert.match(source, /human-experiment-language/, filename + ' must share the selected language across pages');
    assert.match(source, /split\('-'\)\[0\]/, filename + ' must normalize language-region tags');
    assert.match(source, /document\.documentElement\.dir/, filename + ' must set document direction');
    assert.match(source, /rtl/, filename + ' must support right-to-left layout');
  }
});

test('Arabic hypothetical-preferences labels do not say default preferences', () => {
  const app = readFileSync(new URL('../public/app.js', import.meta.url), 'utf8');
  const results = readFileSync(new URL('../public/results.js', import.meta.url), 'utf8');
  const preferences = readFileSync(new URL('../public/preferences-i18n.js', import.meta.url), 'utf8');
  for (const [name, source] of [['homepage', app], ['results', results], ['preferences page', preferences]]) {
    assert.doesNotMatch(source, /التفضيلات الافتراضية/, name + ' contains outdated Arabic wording');
  }
  assert.match(app, /"preferences-link": "تخيّل أنك الشخص المتطوّع"/);
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

test('the active personal-preferences questionnaire translates all existing answer options', () => {
  const script = readFileSync(new URL('../public/preference-questions.js', import.meta.url), 'utf8');
  const questionnaire = runInNewContext(script + '\npreferenceQuestions');

  assert.deepEqual(Object.keys(questionnaire).sort(), [...locales].sort());
  for (const locale of locales) {
    const entry = questionnaire[locale];
    for (const [key, count] of Object.entries({ questions: 3, helpers: 3, scope: 6, motivation: 9, summaryLabels: 3 })) {
      assert.equal(entry[key].length, count, `${locale}: ${key}`);
      assert.ok(entry[key].every(value => typeof value === 'string' && value.trim()), `${locale}: ${key}`);
    }
    assert.ok(entry.free.trim() && entry.noSelection.trim(), locale);
    if (locale !== 'en') {
      assert.notEqual(entry.questions[0], questionnaire.en.questions[0], locale);
      assert.notEqual(entry.scope[0], questionnaire.en.scope[0], locale);
    }
  }
});

test('both homepage role actions and the strengthened survey prompt are localized', () => {
  const end = source.indexOf('\n};');
  const localized = runInNewContext(source.slice(0, end + 3) + '\ntranslations');
  for (const key of ['decision-role-title', 'prompt', 'start-survey', 'preferences-title', 'preferences-copy', 'preferences-preview', 'preferences-link', 'q1']) {
    const values = locales.map(locale => localized[locale][key]);
    assert.ok(values.every(value => typeof value === 'string' && value.trim()), key);
    assert.equal(new Set(values).size, locales.length, key);
  }
});


test('published option labels map to the same survey choice in all nine languages', () => {
  const server = readFileSync(new URL('../src/index.js', import.meta.url), 'utf8');
  const stored = runInNewContext(server.match(/const OPTIONS = [\s\S]*?\n};/)[0] + '\nOPTIONS');
  const options = readFileSync(new URL('../public/survey-options.js', import.meta.url), 'utf8');
  const results = readFileSync(new URL('../public/results.js', import.meta.url), 'utf8');
  const translate = results.slice(results.indexOf('function translateOption('), results.indexOf('function makeBars('));
  for (const lang of locales) {
    const ui = runInNewContext(options + '\n' + translate + '\n({translateOption, QUESTION_OPTIONS})', {lang});
    for (const question of ['q2','q3','q4']) {
      const labels = ui.QUESTION_OPTIONS[question][lang];
      assert.equal(labels.length,stored[question].en.length);
      assert.equal(new Set(labels).size, labels.length);
      stored[question].en.forEach((english,index) => {
        const pair = english + ' / ' + stored[question].ru[index];
        assert.equal(ui.translateOption(question,pair),labels[index]);
        if (lang !== 'en') assert.notEqual(labels[index],english);
      });
    }
  }
});
