import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { authorizeAndDispatch, BridgeDenied, validateExecutionIntent } from '../runtime/bridge-policy.mjs';

const request = (operation = 'runtime.status') => ({
  version: 'cryptic.intent.v1', operation, requestId: randomUUID(), params: {}
});
const authorized = () => {
  const now = Math.floor(Date.now() / 1000);
  const seen = new Set();
  return {
    identityVerified: true,
    claims: {
      iss: 'crypticnews.org', aud: 'cryptic-execution', sub: 'authorized-local-test',
      iat: now, exp: now + 60, scopes: ['runtime.read'], jti: randomUUID()
    },
    replayStore: { async consume(jti) { if (seen.has(jti)) return false; seen.add(jti); return true; } },
    adapters: { 'runtime.status': async () => ({ ok: true, operationId: randomUUID() }) }
  };
};
test('rejects unsupported native execution and sensitive parameters', () => {
  assert.throws(() => validateExecutionIntent(request('shell.execute')), e => e.code === 'OPERATION_DENIED');
  assert.throws(() => validateExecutionIntent({ ...request(), params: { command: 'whoami' } }),
    e => e.code === 'SENSITIVE_OR_UNSAFE_INPUT');
});
test('rejects missing verified identity', async () => {
  await assert.rejects(authorizeAndDispatch(request(), { ...authorized(), identityVerified: false }),
    e => e instanceof BridgeDenied && e.code === 'UNAUTHENTICATED');
});
test('denies incorrect audience and scope', async () => {
  const a = authorized(); a.claims.aud = 'other';
  await assert.rejects(authorizeAndDispatch(request(), a), e => e.code === 'INVALID_AUDIENCE');
  const b = authorized(); b.claims.scopes = [];
  await assert.rejects(authorizeAndDispatch(request(), b), e => e.code === 'INSUFFICIENT_SCOPE');
});
test('denies expired tokens and requires shared replay protection', async () => {
  const a = authorized(); a.claims.exp = Math.floor(Date.now() / 1000) - 1;
  await assert.rejects(authorizeAndDispatch(request(), a), e => e.code === 'EXPIRED_OR_INVALID_TOKEN');
  const b = authorized(); b.replayStore = null;
  await assert.rejects(authorizeAndDispatch(request(), b), e => e.code === 'REPLAY_STORE_REQUIRED');
});
test('one capability cannot execute twice', async () => {
  const a = authorized(), intent = request();
  const r = await authorizeAndDispatch(intent, a);
  assert.equal(r.status, 'EXECUTED_UNVERIFIED');
  assert.match(r.receiptSha256, /^[0-9a-f]{64}$/);
  await assert.rejects(authorizeAndDispatch(intent, a), e => e.code === 'REPLAY_DETECTED');
});
test('unconfigured actions never report execution or production verification', async () => {
  const a = authorized(); a.adapters = {};
  const r = await authorizeAndDispatch(request(), a);
  assert.equal(r.status, 'NOT_CONFIGURED');
  assert.equal(r.ok, false);
});
