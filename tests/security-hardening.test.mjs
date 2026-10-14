import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL('../' + path, import.meta.url), 'utf8');

test('Hyperterminal keeps local adapters honest and loopback-bound', async () => {
  const axs = await read('src/components/modules/AXSModule.tsx');
  const genie = await read('src/components/modules/GenieDjinnModule.tsx');
  const vite = await read('vite.config.ts');
  assert.match(axs, /Request recorded locally/);
  assert.match(axs, /No PTY command was executed/);
  assert.doesNotMatch(axs, /termux-exec|v22\.14\.0|Session Token: loopback\.authenticated/);
  assert.doesNotMatch(genie, /Air-gapped latent synthesis completed|World geometry synthesized from seed/);
  assert.match(genie, /intentLength/);
  assert.match(genie, /seedLength/);
  assert.match(vite, /host:\s*'127\.0\.0\.1'/);
});

test('Hyperterminal ledger persistence strips raw operational fields', async () => {
  const source = await read('src/store/crypticContext.tsx');
  assert.match(source, /sanitizeLedgerData/);
  assert.match(source, /PRIVATE_LEDGER_FIELDS/);
  assert.match(source, /data: sanitizeLedgerData\(data\)/);
  assert.doesNotMatch(source, /localStorage\.setItem\('cryptic\.ledger', JSON\.stringify\(data\)/);
});

test('SSH identity UI does not ship a stale example key or fingerprint', async () => {
  const source = await read('src/components/modules/SSHIdentityModule.tsx');
  assert.doesNotMatch(source, /AAAAIH9a508N1s8Zq3X9b7kF7f3V7e9p21qR8yU9t7Z4k1aB/);
  assert.doesNotMatch(source, /SHA256:7f9a21b34e8912cde489b01fa239/);
  assert.match(source, /ENTER A PUBLIC KEY TO COMPUTE/);
});
