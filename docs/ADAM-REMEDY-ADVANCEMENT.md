# ADAM Remedy Advancement — executable contract

A mock, simulation, TODO, unverified claim, or null return is a **remedy input**, not a completed feature. The system must record the capability gap, implement an adapter, and require executable proof before promoting the capability.

## Gate sequence
DISCOVER → OBSERVE → NORMALIZE → CLASSIFY → VERIFY → FINGERPRINT → LOOKUP_REMEDY → APPLY_REMEDY → REVERIFY.

## Required behavior
1. Preserve the requested capability and trace it to an implementation issue.
2. Prefer real local implementation over a simulated success message.
3. Keep a durable, bounded fallback; never silently report fallback as primary success.
4. Return typed states: queued, delivered, degraded, failed. No success-shaped nulls.
5. For dangerous or external operations require scoped authorization and an evidence receipt.
6. Mark PRODUCTION_VERIFIED only after build, tests, and a real environment check.

## 6,000-agent logical filesystem
60 shards, 100 agent slots each, numbered 0001..6000.
Example: /agents/shard-0001/agent-0001/{inbox,outbox,ledger,quarantine}.
Agent identities are deterministic. Slots are logical metadata; **6,000 active compute workers have not been provisioned**.

## Transport
`dispatchAgentTransfer` journals a payload and receipt to browser localStorage, tries the primary VFS path, then an agent outbox, then quarantine. Degraded state identifies fallback use. A failed state remains inspectable if the storage backend is operational.

## Remaining implementation gates
- Durable IndexedDB / server-backed queues and quota/recovery tests.
- Cryptographic SHA-256, tamper-evident ledger and transaction atomicity.
- Real cross-device transport with authenticated agent identities.
- 6,000-agent scheduling/load and memory benchmarks.
- Real MHTML capture, speech interface, EuroHPC adapter and independent compliance review.

A capability must not claim any of these until implemented and proven.
