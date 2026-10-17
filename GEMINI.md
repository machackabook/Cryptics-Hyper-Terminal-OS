# GEMINI.md — NEXUS Chrome Developer Integration
Use AGENTS.md and docs/CHROME_DEVELOPER_BRIDGE_v15.md as local repo context. These instructions do not grant authentication.
The command line may invoke tools/chrome-bridge/mcp-stdio.mjs only on an authorized local machine using a separately injected NEXUS_BROWSER_TOKEN. Gemini login and project session provenance are separate identities.
Only safe operations exposed by default: browser status/start/tabs/open/click/throttle. Eval is independently unlocked locally and is never exposed via public Pages or the default MCP tool registry.
For Chrome flags, IWA signing, extension packing, BLE/ADB and WebRTC media, require native host permissions and independent verification.
ORCHBENCH → LIVE_EXECUTION → ADAM_PROOF_GATES → PRODUCTION_VERIFIED → ARCHBENCHSHOP. Preserve explicit BLOCKED/UNVERIFIED states.
