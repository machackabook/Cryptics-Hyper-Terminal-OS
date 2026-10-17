import React from 'react';
import { Chrome, ExternalLink, ShieldCheck } from 'lucide-react';
const links: ReadonlyArray<readonly [string,string]> = [
 ['VS Code Web','https://vscode.dev'],
 ['Chrome DevTools','https://developer.chrome.com/docs/devtools/'],
 ['Chrome Extensions','https://developer.chrome.com/docs/extensions/'],
 ['Lighthouse','https://developer.chrome.com/docs/lighthouse/'],
 ['Isolated Web Apps','https://developer.chrome.com/docs/iwa/introduction'],
 ['Cryptic Source','https://github.com/machackabook/Cryptic']
];
export const BrowserDeveloperModule:React.FC<{onClose:()=>void}> = ({onClose}) =>
 <section role="dialog" aria-modal="true" aria-labelledby="chrome-dev-title"
  data-testid="nexus-chrome-developer"
  className="fixed inset-3 sm:inset-[8%] z-[70] overflow-auto rounded-2xl border border-[#9333EA] bg-[#0A0A1F] text-[#E0E7FF] p-6 shadow-2xl font-mono">
  <div className="flex justify-between flex-wrap gap-3">
   <div><div className="text-[#FFCC00] text-xs">NEXUS DEVELOPER BRIDGE · TDOC 12015</div>
    <h2 id="chrome-dev-title" className="text-xl text-[#00FFFF] font-bold"><Chrome className="inline mr-2 w-6 h-6"/>Chrome / Canary Developer Workspace</h2></div>
   <button type="button" onClick={onClose} aria-label="Close developer browser panel" className="border border-cyan-500 rounded px-4 py-2 text-[#00FFFF]">Close ×</button>
  </div>
  <p className="my-5 text-sm">Public interface only. Real browser automation runs in an independently authenticated, local-only Chrome Developer Bridge. This page does not inherit Chrome, Gemini, MCP, ADB, BLE or Enclave permissions.</p>
  <p className="border border-amber-500/50 bg-[#14143D] p-4 rounded-xl text-xs"><ShieldCheck className="inline w-4 h-4 mr-1"/> NATIVE CHROME: NOT CONNECTED · MCP: REQUIRES LOCAL AUTH · EVAL: SECOND-KEY GATED · WebRTC/VoIP: NOT CONFIGURED</p>
  <nav aria-label="Browser developer tools" className="my-5 grid grid-cols-1 md:grid-cols-2 gap-3">
   {links.map(([label,href])=><a key={href} href={href} target="_blank" rel="noopener noreferrer" className="p-4 bg-[#14143D] border border-cyan-900 rounded-xl text-[#00FFFF] hover:border-[#00FFFF]"><ExternalLink className="inline w-4 h-4 mr-2"/>{label}</a>)}
  </nav>
  <p className="text-[#94A3B8] text-xs">Start the separately reviewed tools/chrome-bridge/launch.sh on a computer you control. Production promotion requires verified ADAM gates, device consent and signed session evidence.</p>
 </section>;
