# Hyperterminal security controls

This repository is a browser UI with an optional local Rust/Node bridge. The UI is
not a proof of an attached PTY, receiver, SSH identity, model, or network route.

The hardening follow-up:

- binds Vite development and preview servers to 127.0.0.1;
- keeps the bridge loopback and capability-gated, with mutation actions denied by default;
- records only bounded metadata in the browser ledger; raw commands, prompts, tokens and
  location-like fields are filtered before localStorage writes;
- removes fabricated PTY output, device uptime, model-completion and SSH key/fingerprint
  claims; UI buttons record local requests until a separately authenticated adapter exists;
- scans JavaScript/TypeScript/HTML sources for credentials, unsafe sinks, external scripts,
  inline handlers and coverage failures;
- pins workflow actions, disables checkout credentials, installs dependencies without
  lifecycle scripts, and uploads short-lived source evidence;
- provides a disabled main-branch ruleset template and weekly Dependabot action updates.

The existing _headers policy remains the publication boundary. robots.txt and the
AI access file are advisory and do not authenticate operators.

main is currently unprotected. An owner must validate the actual check name after CI
runs, enable secret scanning/push protection where available, review collaborators, and
activate the ruleset through GitHub administration. No branch protection is claimed by
this file.

No production PTY, SSH, hardware receiver, VPN, OAuth callback, or external model adapter
is established by source tests. Configure and verify each adapter separately before
enabling it.
