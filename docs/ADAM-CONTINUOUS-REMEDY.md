# ADAM continuous remedy advancement

ADAM is an automated work scheduler and evidence system, not a static approval blockade.

## States
DISCOVERED → VERIFYING → VERIFIED → RELEASE_CANDIDATE
                    ↘ NEEDS_REMEDY → QUEUED → ASSIGNED → PATCHING → REVERIFYING ↗
When repeated correction fails: DIAGNOSIS_REQUIRED (retain last known good release).

## Initial implementation
`scripts/adam-remedy-loop.mjs` ingests actual Golden Forge discovery evidence, deduplicates required verification jobs by check and revision, preserves attempts/status from an existing local pool, assigns an agent role, and emits `remedy-pool.json`. GitHub Actions schedules intake every six hours when merged to the default branch.

## Required next implementations
1. Run actual checks and capture machine-verifiable exit codes and revision-bound receipts.
2. Durable shared queue outside ephemeral GitHub runners, with lease/claim/retry and idempotency.
3. Authenticated AI Factory patch worker, branch creation and automated PR updates.
4. ADAM re-verification, bounded retries, and verified artifact promotion.
5. Device-specific signed packages, staged rollout, health check, and rollback.
6. Google Drive evidence ingest and versioned memory integration.

No status is promoted based solely on a generated receipt or agent proposal. Safe preapproved changes may flow unattended after end-to-end proof. A failed remediation does not stop the deployed last-known-good release.
