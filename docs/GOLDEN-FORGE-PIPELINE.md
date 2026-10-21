# Golden Forge circular pipeline — first executable stage

The existing `cascade.yml` and `pages-security.yml` run scheduled security checks. This new workflow adds a real six-hour source discovery and SHA-256 fingerprint inventory, with ADAM evidence artifacts.

## Intended system cycle
Drive (authorized intake) → Golden Forge (fingerprint & inventory) → AI Factory (propose patch) → OMNIAPP Store (build device-specific package) → ADAM gates (build/test/security/compatibility) → staged release → device agent (verify installation) → runtime telemetry → remedy cards → next iteration.

## Implemented in this branch
- Deterministic source-file identities derived from paths.
- Real SHA-256 of repository files.
- Source inventory and discovery proof artifact.
- Six-hour GitHub Actions workflow; no GitHub write token required.

## Not yet implemented
- Google Drive authenticated ingestion and provenance.
- Live process/PID/function/event discovery on Samsung, Chromebook, Windows or webOS.
- AI model patch proposal, code review and protected-branch merges.
- Device package builders and signed releases.
- Device registration, opt-in updates, health checks, rollback.
- Self-hosted runners, persistent harvester service, and agent feedback integration.

No workflow may silently merge AI-generated changes, install software on devices, or elevate privileges. Low-risk, preapproved maintenance may be automated once gates and rollback are proven. High-impact actions require operator authorization. `DISCOVER` is not `PRODUCTION_VERIFIED`.
