# Cryptic ↔ HyperTerminal Execution Contract v1

## Repository responsibilities

- Public Cryptic (machackabook/Cryptic): browser UX, visualization, commands, intents.
- Hyper Terminal OS (this repository): interactive OS UI and versioned execution contract.
- Trusted gateway/backend (not yet deployed by this change): actual authorization, adapters, durable replay store, operation-specific limits.
- Private node/Termux bridge: restricted native adapters. Never embed secrets or expose loopback to the internet.

## Cross-repository request

Use a versioned intent envelope with random UUID requestId, allowlisted operation, sanitized params. Clients cannot grant themselves scopes. The server verifies authentication and derives allowed scope from the operation. A *server-only* adapter must pass verified claims to runtime/bridge-policy.mjs, with an atomic durable replay store.

Allowed operations in the initial proof contract:
- runtime.status → runtime.read
- ledger.verify → ledger.verify
- workflow.inspect → workflow.read
- adapter.health → adapter.read

No arbitrary shell, git mutation, terminal replay, device control, remote network scan, model invocation, or financial transaction is allowed by this contract.

The browser is not trusted to supply signed or verified identity claims. OAuth login, key verification, CSRF protection, strict origin checks, CORS allowlist, rate limiting, and network binding remain responsibilities of the backend integration. No authentication endpoint is claimed to exist here.

## Receipt semantics

Results may be NOT_CONFIGURED, EXECUTION_FAILED, or EXECUTED_UNVERIFIED. A SHA-256 receipt hashes operation metadata and is not a digital signature nor proof of TPM or device attestation. ARCHBENCHSHOP/PRODUCTION_VERIFIED requires separately executed ADAM evidence gates and an authorized review decision. Never promote from UI strings or generated examples.

## Security risks discovered in imported React source

- Seeded emergency incidents, weather, friend beacons, sensor data, and quorum votes are included in the new React state. Unless backed by live verified sources, they must be disabled or visibly labelled non-live. Fake hazard/dispatch assertions must never be used for emergencies.
- The current /gemini path prints a claimed inference without a Gemini model response; gateway wiring must replace it or display NOT_CONFIGURED.
- The local ledger accepts unsanitized data into localStorage; only allowlisted metadata should be persisted.
- A local Cosmic Guardian visual gate is not authentication.
- package-lock.json is absent; dependency installation is not reproducible until a reviewed lockfile is committed.

## What CI checks

The workflow scans the *current tree* for recognizable secret markers, tests the pure authorization gate, type-checks, and builds. These do not prove the gateway is live. Full git-history secret scanning, package vulnerability review, real authentication + replay tests against the deployed backend, XSS tests, device permissions, and branch protection remain release blockers.

## Promotion sequence

ORCHBENCH → LIVE_EXECUTION → ADAM_PROOF_GATES → PRODUCTION_VERIFIED → ARCHBENCHSHOP

Keep Cain and Abel independently accountable for verifying the technical evidence and authorization decision; neither may bypass the gates.
