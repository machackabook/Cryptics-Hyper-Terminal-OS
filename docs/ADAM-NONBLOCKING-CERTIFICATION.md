# ADAM certification lifecycle — nonblocking runtime

ADAM is a bounded build, promotion, and remediation service. It is **not** a synchronous policy oracle for every worker call.

## Build and promotion
- Discover candidate → test → verify evidence → certify immutable artifact/version → promote.
- Store certification metadata alongside the artifact; authorized runtime workers use locally available deployment policy.
- When no certification exists, the runtime does not fabricate it. Deployment policy determines whether a beta-only component can be used.

## Steady-state execution
- A worker handles events directly through its local capability and authorization controls.
- No network call to ADAM is required per operation. Normal execution receipts report completion/failure, not ADAM approval.
- Observability and telemetry are asynchronous; failures can be sent to remedy intake without blocking unrelated workers.
- A change to the certified artifact, an invalidated signature, or a relevant security finding can trigger re-verification of that component.

## Scope of ADAM
- ADAM verifies the component/release, not each user action.
- ADAM may inspect sampled or exceptional telemetry asynchronously, but is not the execution-plane scheduler.
- Existing operating-system, browser, account, and device authorization rules continue to apply.
- Independent worker failure isolation and last-known-good rollback remain required.
