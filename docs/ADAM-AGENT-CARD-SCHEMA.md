# ADAM adaptive agent cards

## Identity
An agent maps to one stable host+runtimeKey. A runtimeKey should be a canonical service/function identifier, not a changing PID. Invocations carry separate event IDs. Runtime identity uniqueness is checked within the current browser registry.

## Per-agent card
Kind, role, host, source path, binary fingerprint, owner, behavioral instructions, permitted external connections, permissions, invocation metrics, verified remedies, and model tier.

## Model routing
The current heuristic uses invocation count, criticality and error rate, with a minimum tier. It is a **policy decision**, not an actual model invocation or training pipeline. Actual performance evaluation and cost accounting are required before deploying adaptive routing.

## Harvester implementation requirements
Each binary/source artifact gets an authorized watcher adapter for metadata and hashes. This is not indiscriminate web crawling or execution of untrusted snippets. Watchers must be bounded, deduplicated, permission-scoped and rate-limited. Browser service workers are event-driven and cannot guarantee perpetual execution; a durable host supervisor is required for always-on monitoring.

## Required future work
Native process discovery adapters for Windows/Android/Linux; authenticated event ingestion; actual model endpoints; service worker registration; model evaluation; versioned card UI; and verified feedback loops. Card instructions never override authorization or policy.

## Testable examples
- Assign `host=GAIASWINDOW`, `runtimeKey=service:omniaudio` to agent-0001.
- Assign `host=SamsungA15`, `runtimeKey=service:omniaudio` to agent-0002.
- Record invocations and verified outcomes; calculate a tier without granting extra privileges.
