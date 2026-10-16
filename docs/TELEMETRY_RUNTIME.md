# NEXUS Golden Army Telemetry integration — TDOC 12007, v7.1

**Real runtime implementation, GitHub feature branch only.** `src/components/modules/TelemetryDashboard.tsx` is the source component of the React HyperTerminal. `telemetry/server.mjs` is the separately executed Node.js control plane.

Set a cryptographically random 24+ character bearer secret in the host environment, for example `export NEXUS_GATEWAY_TOKEN="$(node -e 'console.log(require("node:crypto").randomBytes(32).toString("hex"))')"`. Run `node telemetry/server.mjs` on an authorized Linux/Chromebook host and use the Vite frontend on that same host at 127.0.0.1:3000, not as an unauthenticated public API. Default bind 127.0.0.1:8787. Separate production remote access requires approved Cloudflare Access/Tunnel or equivalent authenticated HTTPS ingress, as well as reviewed CORS and secure session handling.

Default GAIA SkillForge runs local deterministic skill cards and reads live OS measurements. It is not a trained LLM, SSO provider, remote cluster, chat storage provider or hidden-thought logger. Optional local Ollama and external OpenAI/xAI adapters are gated behind real configuration and explicit invocation. OAuth is not production verified. 6K agent identities/3K pairs do not mean 6K physical processes. Dispatch only bounded allowlisted network monitoring measurements; no arbitrary host scans, shell, destructive patch or credentials in source.

Source of public site gateway: https://github.com/machackabook/Cryptic/tree/feature/nexus-runtime-cloudflare-adam-v10-20261016/cloudflare/crypticnews

Promotion gates: source integrity; TS build; local HTTP tests; security scans incl. Git history; route/link/button browser suite against actual built app; encrypted backup + restore; separate Cain/Abel approval; and a verified remote deployment with rollback. No PR merge auto-promotion.
