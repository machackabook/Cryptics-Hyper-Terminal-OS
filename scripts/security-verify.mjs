#!/usr/bin/env node
// Real repository working-tree security scan; not a substitute for full history or deployment audit.
import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const ignored = new Set(['.git', 'node_modules', 'dist', 'coverage', '.vite']);
const problems = [], checked = [];
const secretPatterns = [
  ['private key material', /-----BEGIN (?:RSA |EC |OPENSSH |ENCRYPTED )?PRIVATE KEY-----/],
  ['Google API key', /AIza[0-9A-Za-z_-]{30,}/],
  ['OpenAI-style API key', /sk-(?:proj-)?[A-Za-z0-9_-]{20,}/],
  ['GitHub token', /gh[pousr]_[A-Za-z0-9]{20,}/],
  ['Slack token', /xox[baprs]-[A-Za-z0-9-]{10,}/]
];
function visit(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignored.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isSymbolicLink()) { problems.push('symlink requires review: ' + path.relative(root, full)); continue; }
    if (e.isDirectory()) { visit(full); continue; }
    if (!e.isFile()) continue;
    const rel = path.relative(root, full).replaceAll(path.sep, '/');
    const size = fs.statSync(full).size;
    if (size > 2_000_000) { problems.push('oversized unscanned file: ' + rel); continue; }
    const data = fs.readFileSync(full);
    if (data.includes(0)) { checked.push(rel + ' [binary skipped]'); continue; }
    const content = data.toString('utf8');
    checked.push(rel);
    if (rel === 'scripts/security-verify.mjs') continue; // patterns declared here are not credentials
    for (const [label, pattern] of secretPatterns) {
      if (pattern.test(content)) problems.push(rel + ': potential ' + label);
    }
    if (/\.(?:env|pem|key|p12|pfx)$/i.test(rel) && !rel.endsWith('.env.example'))
      problems.push(rel + ': sensitive file extension in public tree');
  }
}
visit(root);
for (const file of ['runtime/bridge-policy.mjs', 'tests/bridge-security.test.mjs', 'src/App.tsx']) {
  if (!fs.existsSync(path.join(root, file))) problems.push('missing proof-gate component: ' + file);
}
if (problems.length) {
  console.error('SECURITY VERIFY FAILED\n' + problems.map(x => ' - ' + x).join('\n'));
  process.exitCode = 1;
} else {
  console.log('SECURITY SCAN PASS: ' + checked.length + ' working-tree files inspected. NOT a live authorization, full-history, or production attestation.');
}
