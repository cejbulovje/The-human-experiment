import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('privacy policy discloses cumulative AI processing in all supported languages', async () => {
  const [html, script] = await Promise.all([
    readFile(new URL('../public/privacy.html', import.meta.url), 'utf8'),
    readFile(new URL('../public/privacy.js', import.meta.url), 'utf8')
  ]);

  assert.match(html, /<h2 data-t="aiTitle">AI-assisted analysis<\/h2>/);
  assert.match(html, /<p data-t="aiUse">[\s\S]*?Cloudflare Workers AI[\s\S]*?no fixed deletion schedule[\s\S]*?<\/p>/);

  for (const locale of ['en', 'ru', 'es', 'pt', 'zh', 'de', 'ja', 'fr', 'ar']) {
    const start = script.indexOf(`\n${locale}:{`);
    assert.notEqual(start, -1, `privacy translations include ${locale}`);
    const end = script.indexOf('\n', start + 1);
    const entry = script.slice(start, end === -1 ? undefined : end);
    assert.match(entry, /aiTitle:/, `${locale} has AI disclosure heading`);
    assert.match(entry, /aiUse:/, `${locale} has AI disclosure text`);
    assert.match(entry, /Cloudflare Workers AI/, `${locale} identifies the AI service`);
  }
});
