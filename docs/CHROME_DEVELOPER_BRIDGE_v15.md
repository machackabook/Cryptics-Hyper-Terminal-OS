# NEXUS Chrome Developer Bridge v15

This repository provides a nonprivileged React browser developer panel. The independently tested native package must be installed on an authorized developer computer. It is not included in this feature branch until separately committed.

The Node 22+ bridge uses a separate Chrome/Canary/Chromium profile, ephemeral 127.0.0.1 debugging port, strong bearer, exact-origin allowlist, SHA-256 linked audit receipts, and independent approval for JavaScript evaluation. MCP stdio exposes only status, startup, tabs, navigation, click and throttling by default.

Never publish Chrome debugging ports, primary Chrome profile cookies, Gemini/MCP API keys, private chat archives, Enclave mounts or localhost bridge credentials to GitHub Pages.

Chrome internal chrome-untrusted:// pages cannot be registered by public webapps. IWAs require signed WebBundles and eligible Chrome installation. Native ADB, BLE, WebRTC telephone signaling and VS Code tunnel credentials are separate permission systems.

ADAM proof gates require a real executable local test, public/private boundary validation, repository signed-session attestation and independent approval before merge.
