import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const read = path => readFile(new URL('../' + path, import.meta.url), 'utf8');

test('Hyperterminal GSEL surface is same-origin and externalized', async () => {
  const html = await read('public/gsel-wave-gradient-engine.html');
  const css = await read('public/gsel-wave-gradient-engine.css');
  const script = await read('public/gsel-wave-gradient-engine.js');
  assert.match(html, /script-src 'self'/);
  assert.match(html, /style-src 'self'/);
  assert.match(html, /connect-src 'self'/);
  assert.doesNotMatch(html, /fonts\.googleapis|fonts\.gstatic|<style\b/i);
  assert.doesNotMatch(html, /\son(?:click|input|change|load|error)\s*=/i);
  assert.doesNotMatch(script, /\.innerHTML\s*=|localStorage|sessionStorage|fetch\s*\(/);
  assert.match(script, /replaceChildren\(\)/);
  assert.match(css, /@media/);
});

test('Hyperterminal exposes an authenticated command-palette launch path', async () => {
  const palette = await read('src/components/CommandPalette.tsx');
  assert.match(palette, /m-gsel/);
  assert.match(palette, /gsel-wave-gradient-engine\.html/);
  assert.match(palette, /noopener,noreferrer/);
});
