import React from 'react';
export const DeveloperBrowserModule: React.FC = () => (
  <section className="h-full overflow-auto bg-[#02050b] p-5 font-mono text-xs text-zinc-300 space-y-4">
    <h2 className="text-[#42f5ff] text-lg">NEXUS Developer Browser</h2>
    <p className="text-[#f5ce70]">Native service disconnected from this public workspace</p>
    <p>The local console controls a separate temporary developer profile through authenticated loopback requests and private CDP pipes. Each operation needs a fresh SYNAPSE capability.</p>
    <p><a className="text-[#74ff9b] underline" href="http://127.0.0.1:7341/" target="_blank" rel="noopener noreferrer">Open local developer console</a> — requires the broker running on this device.</p>
    <p><a className="text-[#42f5ff] underline" href="https://vscode.dev/github/machackabook/Cryptics-Hyper-Terminal-OS" target="_blank" rel="noopener noreferrer">Open HyperTerminal source workspace in vscode.dev</a></p>
    <p><a className="text-[#42f5ff] underline" href="https://github.com/machackabook/Cryptics-Hyper-Terminal-OS/blob/feature/nexus-developer-browser-20261017/docs/NEXUS-DEVELOPER-BROWSER.md" target="_blank" rel="noopener noreferrer">Architecture, host setup, limitations and evidence gates</a></p>
    <dl className="space-y-2"><dt className="text-[#42f5ff]">Configured broker actions</dt><dd>Start/stop developer profile, allowlisted navigation, DOM inspection, network throttling; gateway-mediated MCP and Gemini request contracts.</dd><dt className="text-[#f5ce70]">Additional host integration required</dt><dd>Optional Lighthouse adapter validation, IWA signing, external signaling/TURN, Android pairing, BLE permission, code-server and telecom provider.</dd></dl>
    <p>chrome:// and chrome-untrusted:// are browser internals. Websites cannot register those schemes. EXEs are native programs, not browser documents. APFS mounts require a supported native host and SYNAPSE/SecureFS. Arbitrary evaluation requires a separately authorized isolated runtime.</p>
  </section>
);
