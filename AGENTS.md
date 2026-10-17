# NEXUS Chrome Developer Gate — AGENTS.md
- Read docs/CHROME_DEVELOPER_BRIDGE_v15.md and SECURITY.md before changes.
- All browser controls originate in a private, authenticated local Node/CDP bridge. Public HyperTerminal/Pages only render docs and approved UI.
- Never copy Chrome profile cookies, Gemini OAuth tokens, session transcripts, private thoughts, host secrets, ADB keys, WebRTC signaling credentials or Enclave sparsebundle bytes into source.
- Do not use chrome-untrusted:// as a user-customizable web origin. Native Chromium integration needs an independently reviewed Chromium fork; IWAs require signed WebBundles.
- For browser MCP: explicit user-approved target origin, separate dev profile, secondary evaluation unlock, true local evidence and bounded audit logs.
- Release gate: test actual Chrome startup, origin denial, real page navigation and click, browser teardown, PWA/MV3 manifest generation, source security review, independent approval. A skipped managed-policy test cannot be production PASS.
- Preserve existing Vite/React views and mobile viewport. Do not auto-merge or expose an unrestricted browser CDP endpoint.
