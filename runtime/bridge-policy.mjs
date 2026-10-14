// Cryptic ↔ HyperTerminal execution policy, v1. No network listeners or shell access.
// Only a trusted backend may supply cryptographically verified claims and durable replay storage.
import { createHash } from 'node:crypto';

export const EXECUTION_AUDIENCE = 'cryptic-execution';
export const EXECUTION_ISSUER = 'crypticnews.org';
export const OPERATIONS = Object.freeze({
  'runtime.status': Object.freeze({ scope: 'runtime.read' }),
  'ledger.verify': Object.freeze({ scope: 'ledger.verify' }),
  'workflow.inspect': Object.freeze({ scope: 'workflow.read' }),
  'adapter.health': Object.freeze({ scope: 'adapter.read' })
});

export class BridgeDenied extends Error {
  constructor(code) {
    super(code);
    this.name = 'BridgeDenied';
    this.code = code;
  }
}
const deny = code => { throw new BridgeDenied(code); };
const own = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
const plain = obj => obj !== null && typeof obj === 'object' &&
  (Object.getPrototypeOf(obj) === Object.prototype || Object.getPrototypeOf(obj) === null);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function validateExecutionIntent(intent) {
  if (!plain(intent) || intent.version !== 'cryptic.intent.v1') deny('INVALID_REQUEST');
  if (typeof intent.operation !== 'string' || !own(OPERATIONS, intent.operation)) deny('OPERATION_DENIED');
  if (typeof intent.requestId !== 'string' || !UUID.test(intent.requestId)) deny('INVALID_REQUEST_ID');
  if (!plain(intent.params || {})) deny('INVALID_PARAMS');
  const params = intent.params || {};
  let encoded;
  try { encoded = JSON.stringify(params); } catch { deny('INVALID_PARAMS'); }
  if (!encoded || Buffer.byteLength(encoded, 'utf8') > 4096) deny('PAYLOAD_TOO_LARGE');
  for (const forbidden of ['credential', 'token', 'password', 'key', 'privateKey', 'shell', 'command']) {
    if (own(params, forbidden)) deny('SENSITIVE_OR_UNSAFE_INPUT');
  }
  return { version: intent.version, operation: intent.operation, requestId: intent.requestId, params };
}

/**
 * authenticatedContext must be injected internally by an identity verifier; NEVER deserialize
 * identityVerified or claims from a public JSON request. replayStore.consume(jti) must be
 * globally atomic and durable across all workers. Adapters are server-side allowlisted functions.
 */
export async function authorizeAndDispatch(intent, authenticatedContext) {
  const req = validateExecutionIntent(intent);
  const { identityVerified, claims, replayStore, adapters } = authenticatedContext || {};
  if (identityVerified !== true || !plain(claims)) deny('UNAUTHENTICATED');
  const now = Math.floor(Date.now() / 1000);
  if (claims.iss !== EXECUTION_ISSUER || claims.aud !== EXECUTION_AUDIENCE) deny('INVALID_AUDIENCE');
  if (typeof claims.sub !== 'string' || claims.sub.length < 3) deny('INVALID_SUBJECT');
  if (!Number.isInteger(claims.iat) || !Number.isInteger(claims.exp) ||
      claims.iat > now + 30 || claims.iat < now - 300 ||
      claims.exp <= now || claims.exp - claims.iat > 300) deny('EXPIRED_OR_INVALID_TOKEN');
  const scope = OPERATIONS[req.operation].scope;
  if (!Array.isArray(claims.scopes) || !claims.scopes.includes(scope)) deny('INSUFFICIENT_SCOPE');
  if (typeof claims.jti !== 'string' || claims.jti.length < 16 || claims.jti.length > 128) deny('INVALID_JTI');
  if (!replayStore || typeof replayStore.consume !== 'function') deny('REPLAY_STORE_REQUIRED');
  if (!(await replayStore.consume(claims.jti, claims.exp))) deny('REPLAY_DETECTED');

  // Do not treat merely valid authentication as evidence that an adapter executed.
  if (!plain(adapters) || !own(adapters, req.operation) || typeof adapters[req.operation] !== 'function') {
    return { ok: false, status: 'NOT_CONFIGURED', operation: req.operation, requestId: req.requestId };
  }
  const result = await adapters[req.operation](req.params, { subject: claims.sub, requestId: req.requestId });
  if (!result || result.ok !== true || typeof result.operationId !== 'string') {
    return { ok: false, status: 'EXECUTION_FAILED', operation: req.operation, requestId: req.requestId };
  }
  const receipt = createHash('sha256').update(JSON.stringify({
    version: req.version, operation: req.operation, requestId: req.requestId,
    operationId: result.operationId, subject: claims.sub
  })).digest('hex');
  // Never return PRODUCTION_VERIFIED: ADAM verification is a separate evidence gate.
  return { ok: true, status: 'EXECUTED_UNVERIFIED', operation: req.operation,
    requestId: req.requestId, operationId: result.operationId, receiptSha256: receipt };
}
