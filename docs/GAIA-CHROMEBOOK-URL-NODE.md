# GAIA Chromebook URL-first Linux node contract

## Browser-to-Linux separation
- HyperTerminal is the user-facing browser application.
- Crostini is a separate Linux execution environment reachable through an explicitly started localhost HTTP service.
- The service requires authentication and narrowly scoped commands; a browser tab never receives unrestricted shell execution.
- Same-origin tabs can exchange typed non-sensitive status events via BroadcastChannel (`src/services/gaiaTabBus.ts`).
- Cross-origin tabs require an authenticated HTTP/WebSocket bridge or an explicitly permitted extension; merely sharing Chrome is not sufficient.
- Browser control requires the user's explicit authorization and the browser's own permission model.

## Commissioning order
1. Complete Drive-backed Crostini bootstrap and verify durable upload/recovery.
2. Launch local GAIA service from Crostini; authenticate its API. Localhost exposure must be verified on the Chromebook.
3. Serve the Linux-facing interface on localhost and confirm it can contact the service.
4. Register the compute node with a device-specific identity and approved capability inventory.
5. Connect HyperTerminal to the localhost bridge through explicit origin, authentication and consent checks.
6. Exchange `node.hello`, `node.status`, `job.receipt`, and `capability.changed` events across **same-origin** tabs.
7. Add bounded browser workers and model adapters. Upload evidence to Drive; confirm hashes before cleanup.
8. Run end-to-end tests: cross-tab isolation, unauthorized-origin rejection, consent revocation, offline retry, and reboot recovery.

## Security and storage
- Never treat the `chrome-untrusted://` scheme as a privileged execution surface. Chrome internal/untrusted pages have different isolation rules and cannot be assumed to host arbitrary custom integrations.
- Google Drive stores durable artifacts and checkpoints, not active Crostini root filesystems or browser profiles.
- ADAM certifies components at release boundaries, not every worker invocation.
- GOD Protocol opt-in governs optional enhanced capabilities; ordinary authorized functions continue independently.

## Current implementation
- `src/services/gaiaTabBus.ts`: typed same-origin event bus (implemented).
- `scripts/gaia-localhost-service.mjs`: local consent API (implemented; not a command runner).
- Linux URL interface, authenticated cross-origin event bridge, browser-control adapter and node registration: pending.
