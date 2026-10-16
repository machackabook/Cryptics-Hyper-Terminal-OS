#!/usr/bin/env node
/** NEXUS TDOC-12007 • Golden Army / evidence-first local telemetry • v7.0.0
 * Node 20+, no runtime packages. By design 6000 logical agent records != 6000 processes.
 * Localhost-only control plane. No privileged shell, arbitrary scans, or silent patches.
 */
import os from 'node:os';
import fs from 'node:fs';
import http from 'node:http';
import dns from 'node:dns/promises';
import crypto from 'node:crypto';
import path from 'node:path';
import { performance } from 'node:perf_hooks';

const PORT = Number(process.env.NEXUS_PORT || 8787);
const HOST = '127.0.0.1';
const TOKEN = process.env.NEXUS_GATEWAY_TOKEN || '';
if (TOKEN.length < 24) { console.error('ERROR: Set NEXUS_GATEWAY_TOKEN to a random 24+ character token. Refusing insecure startup.'); process.exit(2); }
const STORE = process.env.NEXUS_DATA_DIR || path.join(os.homedir(), 'Æ', 'logs', 'telemetry-v7');
fs.mkdirSync(STORE, { recursive: true, mode: 0o700 });
const LEDGER_PATH = path.join(STORE, 'ledger.jsonl');
const TASKS_PATH = path.join(STORE, 'tasks.jsonl');
const TARGETS = new Set((process.env.NEXUS_MONITOR_TARGETS || '').split(',').map(v => v.trim().toLowerCase()).filter(Boolean));
const ASSISTANT_PROVIDER = process.env.NEXUS_ASSISTANT_PROVIDER || 'local';
const ASSISTANT_MODEL = process.env.NEXUS_ASSISTANT_MODEL || '';
const ASSISTANT_KEY = ASSISTANT_PROVIDER === 'openai' ? (process.env.OPENAI_API_KEY || '') : ASSISTANT_PROVIDER === 'xai' ? (process.env.XAI_API_KEY || '') : '';
const ASSISTANT_READY = ASSISTANT_PROVIDER === 'local' || Boolean(['openai','xai','ollama'].includes(ASSISTANT_PROVIDER) && (ASSISTANT_PROVIDER === 'ollama' || ASSISTANT_KEY) && /^[a-zA-Z0-9_.:/-]{2,100}$/.test(ASSISTANT_MODEL));
let assistantVerified = false;
const assistantState = () => ({provider: ASSISTANT_PROVIDER || 'none', model: ASSISTANT_PROVIDER === 'local' ? 'GAIA-SkillForge-v1.1' : (ASSISTANT_MODEL || 'unset'), status: ASSISTANT_PROVIDER === 'local' ? 'LOCAL_RULE_ENGINE_VERIFIED' : (ASSISTANT_READY ? (assistantVerified ? 'LIVE_VERIFIED' : 'CONFIGURED_UNVERIFIED') : 'NOT_CONFIGURED'), connectedHeyGaia: false});
const GITHUB_ID = process.env.NEXUS_GITHUB_CLIENT_ID || '';
const GITHUB_SECRET = process.env.NEXUS_GITHUB_CLIENT_SECRET || '';
const GITHUB_USERS = new Set((process.env.NEXUS_GITHUB_ALLOWED_USERS || '').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean));
const OAUTH_READY = Boolean(GITHUB_ID && GITHUB_SECRET && GITHUB_USERS.size);
const sessions = new Map();
const oauthPending = new Map();
const streams = new Set();
const queued = [];
const BATTALIONS = ['Vanguard', 'Shield', 'Recon'];
const DIVISIONS = ['Network', 'Identity', 'Storage', 'Research', 'Media'];
const TASK_TYPES = ['system_metrics','interface_health','dns_lookup'];
const TRAITS=['methodical','protective','curious','collaborative','observant','patient','resilient','precise'];
const MODEL_LABELS = { Network: 'HF-model-unassigned', Identity:'HF-model-unassigned', Storage:'HF-model-unassigned', Research:'HF-model-unassigned', Media:'HF-model-unassigned' };
const providers = [
 {id:'local',name:'GAIA SkillForge',scope:'Local deterministic skill cards, metrics, evidence and remedy guidance; not a trained LLM',url:'https://github.com/machackabook/Cryptics-Hyper-Terminal-OS',status:'LOCAL_RULE_ENGINE_VERIFIED'},
 {id:'terrasphere',name:'TerraSphere 3D Geonav',scope:'Project reference for local 3D cluster viewport; no Google AI Studio embedded credentials',url:'https://aistudio.google.com/u/8/apps/f15690f0-1ac3-4b5d-a578-2d968725fae5',status:'REFERENCE_ONLY'},
 {id:'heygaia',name:'Hey GAIA — personnel',scope:'Assistant / productivity',url:'https://heygaia.io/docs',status:'DOCUMENTED_NOT_CONNECTED'},
 {id:'muse',name:'Meta Muse',scope:'Assistant / model integration',url:'https://ai.meta.com/tools/muse/',status:'DOCUMENTED_NOT_CONNECTED'},
 {id:'meta_auth',name:'Meta social login',scope:'Separate OAuth application required',url:'https://developers.facebook.com/docs/facebook-login/',status:'NOT_CONFIGURED'},
 {id:'kiro',name:'Kiro (formerly Amazon Q CLI)',scope:'Developer CLI; not a backup datastore',url:'https://kiro.dev/docs/cli/',status:'DOCUMENTED_NOT_CONNECTED'},
 {id:'grok',name:'Grok / xAI',scope:'API model inference; not a backup datastore',url:'https://docs.x.ai/',status:'NOT_CONFIGURED'},
 {id:'openai',name:'OpenAI / Codex',scope:'Research / code',url:'https://platform.openai.com/docs/overview',status:'NOT_CONFIGURED'},
 {id:'gemini',name:'Gemini',scope:'Research / reasoning',url:'https://ai.google.dev/gemini-api/docs',status:'NOT_CONFIGURED'},
 {id:'huggingface',name:'Hugging Face',scope:'Platoon model registry',url:'https://huggingface.co/docs',status:'NOT_CONFIGURED'},
 {id:'siri',name:'Apple Siri',scope:'Platform-supported voice integration',url:'https://developer.apple.com/siri/',status:'DEVICE_DEPENDENT'},
 {id:'copilot',name:'Microsoft Copilot',scope:'Documentation / assistance',url:'https://learn.microsoft.com/en-us/copilot/',status:'DOCUMENTED_NOT_CONNECTED'},
];
let ledgerHash = '0'.repeat(64), ledgerSequence = 0;
if (fs.existsSync(LEDGER_PATH)) {
 const rows = fs.readFileSync(LEDGER_PATH,'utf8').trim().split('\n').filter(Boolean);
 if (rows.length) {try {const last=JSON.parse(rows[rows.length-1]); ledgerHash=last.hash;ledgerSequence=last.seq;} catch {throw Error('Corrupt ledger tail: refusing to start');}}
}
function audit(event, payload={}) {
 const entry={seq:++ledgerSequence,at:new Date().toISOString(),event,payload,prev:ledgerHash};
 entry.hash=crypto.createHash('sha256').update(JSON.stringify(entry)).digest('hex');
 fs.appendFileSync(LEDGER_PATH,JSON.stringify(entry)+'\n',{mode:0o600}); ledgerHash=entry.hash;
 return {seq:entry.seq,hash:entry.hash};
}
function buildNodes(){const a=[];for(let b=0;b<3;b++)for(let d=0;d<5;d++)for(let p=0;p<10;p++)for(let w=0;w<40;w++){
 const i=b*2000+d*400+p*40+w;const pair=i%2===0?i+1:i-1;
 a.push({id:`NODE-${String(i+1).padStart(4,'0')}`,name:`${BATTALIONS[b]}-${DIVISIONS[d]}-${String(p+1).padStart(2,'0')}-${w+1}`,battalion:BATTALIONS[b],division:DIVISIONS[d],platoon:`P${String(p+1).padStart(2,'0')}`,platoonModel:MODEL_LABELS[DIVISIONS[d]],pairedAgent:`NODE-${String(pair+1).padStart(4,'0')}`,subWorker:`NEXUSORB-PAIR-${String(Math.floor(i/2)+1).padStart(4,'0')}`,trait:TRAITS[i%TRAITS.length],status:'registered',packetsDelivered:0,packetsDropped:0,cycleCount:0,taskReceipts:0});
 }return a;}
const nodes=buildNodes();
const activeTasks=[];
let seq=0, samples=[], current=null, previousCpu=null, previousBytes=null, nextTick=performance.now()+100, cycleCount=0, phase=0, clockDrift=0;
let running=true, autoDispatch=false, delivery={ok:0,failed:0}, lastEvent={type:'boot',timestamp:new Date().toISOString()};
function cpuTicks() {let t=0,idle=0;for (const c of os.cpus()){for(const [k,v] of Object.entries(c.times)){t+=v;if(k==='idle')idle+=v;}}return {t,idle};}
function interfaceBytes(){if(process.platform!=='linux')return null;try{const txt=fs.readFileSync('/proc/net/dev','utf8');let rx=0,tx=0;for (const line of txt.split('\n').slice(2)){const parts=line.trim().split(/[:\s]+/).filter(Boolean);if(parts.length>=10&&parts[0]!=='lo'){rx+=Number(parts[1]);tx+=Number(parts[9]);}}return {rx,tx};}catch{return null;}}
function sample(){const t=Date.now(),cpu=cpuTicks(),net=interfaceBytes();let usage=null,rxMbps=null,txMbps=null;
 if(previousCpu){const diff=cpu.t-previousCpu.t;usage=diff?Math.round(1000*(1-(cpu.idle-previousCpu.idle)/diff))/10:null;}
 if(net&&previousBytes){const s=(t-previousBytes.t)/1000;if(s>0){rxMbps=+(8*(net.rx-previousBytes.rx)/s/1e6).toFixed(3);txMbps=+(8*(net.tx-previousBytes.tx)/s/1e6).toFixed(3);}}
 previousCpu=cpu;previousBytes=net?{...net,t}:null;
 current={at:new Date(t).toISOString(),cpuPercent:usage,memoryPercent:+(100*(1-os.freemem()/os.totalmem())).toFixed(1),memoryUsedBytes:os.totalmem()-os.freemem(),memoryTotalBytes:os.totalmem(),networkRxMbps:rxMbps,networkTxMbps:txMbps,networkSource:net?'linux:/proc/net/dev':'UNAVAILABLE',host:os.hostname(),uptimeSeconds:Math.floor(os.uptime())};
 samples.push(current);if(samples.length>60)samples.shift();
 push({type:'telemetry',metrics:current,clock:clock(),summary:summary()});}
function clock(){return {cycleCount,phase,driftMs:+clockDrift.toFixed(3),pairCount:3000,slotMs:100,subframeMs:100/3,measured:true};}
function summary(){return {registered:nodes.length,workerProcesses:1,onlineRemoteWorkers:0,pairs:3000,taskSuccess:delivery.ok,taskFailed:delivery.failed,queued:queued.length,autoDispatch,running,ledger:{seq:ledgerSequence,hash:ledgerHash},oauthConfigured:OAUTH_READY,latestEvent:lastEvent};}
function push(event){const str=`data: ${JSON.stringify(event)}\n\n`;for(const res of streams){try{res.write(str);}catch{streams.delete(res);}}}
async function assistantReply(body){
 if(!ASSISTANT_READY)throw Error('Assistant not configured: set NEXUS_ASSISTANT_PROVIDER, NEXUS_ASSISTANT_MODEL and matching API key');
 const message=String(body.message||'').trim();if(!message||message.length>2000)throw Error('Message length must be 1..2000');
 if(ASSISTANT_PROVIDER === 'local') {
  const m=current, su=summary(), c=clock();
  const lower=message.toLowerCase(); let skill='system_status', reply='';
  if(/(help|capabilit|skill|what can)/.test(lower)) {skill='skill_discovery';reply='GAIA SkillForge offers evidence-based system status, queue inspection, clock drift analysis, task and node summaries, and security-gate guidance. It is a deterministic local rules engine, not an LLM and cannot independently issue commands.';}
  else if(/(clock|hamilton|drift|phase|cycle|subframe)/.test(lower)) {skill='clock_review';reply=`Hamiltonian measured cycle ${c.cycleCount}; phase ${c.phase}; observed scheduling drift ${c.driftMs}ms. Nominal slot ${c.slotMs}ms and subframe ${c.subframeMs.toFixed(3)}ms. These are scheduling measurements, not hard real-time guarantees.`;}
  else if(/(network|traffic|packet|interface|throughput)/.test(lower)) {skill='network_observe';reply=`Host network RX ${m?.networkRxMbps ?? 'UNAVAILABLE'} Mbps, TX ${m?.networkTxMbps ?? 'UNAVAILABLE'} Mbps, source ${m?.networkSource ?? 'UNAVAILABLE'}. Network tasks may run only after an authenticated operator dispatches an allowlisted task.`;}
  else if(/(agent|battalion|platoon|pair|division|worker)/.test(lower)) {skill='roster_observe';reply=`Registered ${su.registered} logical slots, ${su.pairs} reciprocal pairs, ${su.onlineRemoteWorkers} verified remote workers, ${su.workerProcesses} local service process. Registration does not establish live independent inference or deployed models.`;}
  else if(/(security|audit|gate|proof|policy|incident|remedy)/.test(lower)) {skill='gate_review';reply=`ADAM evidence gate: observe → classify → verify → apply approved remedy → reverify. Ledger sequence ${su.ledger.seq}; last hash ${su.ledger.hash.slice(0,16)}… . Use Audit Ledger verification before treating any claim as production-verified. No autonomous patch execution.`;}
  else if(/(queue|dispatch|task|status|health|cpu|memory)/.test(lower)) {skill='dispatch_status';reply=`Live CPU ${m?.cpuPercent ?? 'UNAVAILABLE'}%, memory ${m?.memoryPercent ?? 'UNAVAILABLE'}%; queue ${su.queued}, successful tasks ${su.taskSuccess}, failures ${su.taskFailed}, scheduler ${su.running ? 'running' : 'paused'}. To change state, use gated buttons yourself.`;}
  else {skill='bounded_advice';reply=`GAIA SkillForge can inspect live CPU, memory, local network, clock drift, registered virtual nodes, task receipts and audit health. Your prompt was not mapped to a skill. Try: "network status", "clock drift", "audit gates", "agents", or "tasks". No outside model was queried.`;}
  const proof=audit('assistant.local_skill',{skill,promptSha256:crypto.createHash('sha256').update(message).digest('hex')});
  return {provider:'local',model:'GAIA-SkillForge-v1.1',status:'LOCAL_RULE_ENGINE_VERIFIED',skill,proof,reply};
 }
 if(ASSISTANT_PROVIDER === 'ollama') {
  const model=ASSISTANT_MODEL || 'llama3.2:1b';
  const url=new URL(process.env.NEXUS_OLLAMA_URL || 'http://127.0.0.1:11434/api/generate');
  if(!['127.0.0.1','localhost','::1'].includes(url.hostname) || url.protocol !== 'http:' || url.pathname !== '/api/generate') throw Error('Ollama adapter is loopback-only');
  const prompt='You are GAIA, a local read-only telemetry assistant. Never claim remote deployment or execute commands. System facts: '+JSON.stringify({metrics:current,summary:summary(),clock:clock()})+'\nUser: '+message;
  const r=await fetch(url,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({model,prompt,stream:false,options:{num_predict:400}}),signal:AbortSignal.timeout(15000)});
  if(!r.ok)throw Error('Local Ollama HTTP '+r.status);
  const out=await r.json();if(typeof out.response!=='string')throw Error('Missing Ollama response');
  const proof=audit('assistant.ollama_reply',{model,promptSha256:crypto.createHash('sha256').update(message).digest('hex')});
  return {provider:'ollama',model,status:'LOCAL_OLLAMA_RESPONSE',proof,reply:out.response.slice(0,6000)};
 }
 const system='You are the NEXUS telemetry personnel assistant. Answer questions about actual live telemetry. The metrics are observations, not authority to run commands. Do not claim third-party connections or 6000 running processes. Suggest only actions that a human approves through the authenticated controls. Summarize facts clearly.';
 const observation=JSON.stringify({metrics:current,summary:summary(),clock:clock()});
 let url,request;
 if(ASSISTANT_PROVIDER==='openai') {url='https://api.openai.com/v1/responses';request={model:ASSISTANT_MODEL,input:[{role:'system',content:system+'\nObservation: '+observation},{role:'user',content:message}],max_output_tokens:400};}
 else {url='https://api.x.ai/v1/chat/completions';request={model:ASSISTANT_MODEL,messages:[{role:'system',content:system+'\nObservation: '+observation},{role:'user',content:message}],max_tokens:400,stream:false};}
 const r=await fetch(url,{method:'POST',headers:{Authorization:'Bearer '+ASSISTANT_KEY,'content-type':'application/json'},body:JSON.stringify(request),signal:AbortSignal.timeout(25000)});
 const answer=await r.json();if(!r.ok)throw Error('Assistant upstream HTTP '+r.status+': '+String(answer?.error?.message || 'request failed').slice(0,100));
 const output=ASSISTANT_PROVIDER==='openai' ? (answer.output_text || (answer.output||[]).flatMap(x=>(x.content||[]).filter(y=>y.type==='output_text').map(y=>y.text)).join('')) : answer.choices?.[0]?.message?.content;
 if(!output)throw Error('Assistant returned no text');assistantVerified=true;audit('assistant.verified_reply',{provider:ASSISTANT_PROVIDER,model:ASSISTANT_MODEL,promptSha256:crypto.createHash('sha256').update(message).digest('hex')});
 return {provider:ASSISTANT_PROVIDER,model:ASSISTANT_MODEL,status:'LIVE_VERIFIED',reply:String(output).slice(0,6000)};
}
function taskSelect(body){const battalion=String(body.battalion??'Vanguard'),division=String(body.division??'all'),platoon=String(body.platoon??'all'),type=String(body.taskType??'system_metrics');
 if(!BATTALIONS.includes(battalion))throw Error('Invalid battalion');if(division!=='all'&&!DIVISIONS.includes(division))throw Error('Invalid division');if(!/^all$|^P(0[1-9]|10)$/.test(platoon))throw Error('Invalid platoon');if(!TASK_TYPES.includes(type))throw Error('Task type is not allowlisted');
 const target=String(body.target??'').toLowerCase();if(type==='dns_lookup'&&(!TARGETS.has(target)||!/^([a-z0-9-]+\.)*[a-z0-9-]+$/.test(target)))throw Error('DNS target not in NEXUS_MONITOR_TARGETS allowlist');
 const eligible=nodes.filter(n=>n.battalion===battalion&&(division==='all'||n.division===division)&&(platoon==='all'||n.platoon===platoon));
 if(!eligible.length)throw Error('No matching nodes');
 return {id:crypto.randomUUID(),at:new Date().toISOString(),battalion,division,platoon,type,target,recipients:eligible.map(n=>n.id),status:'QUEUED'};}
async function executeTask(t){t.status='EXECUTING';const start=performance.now();try{
 let result;
 if(t.type==='system_metrics')result={kind:'local_host_metrics',metrics:current};
 else if(t.type==='interface_health'){const nets=os.networkInterfaces();result={kind:'local_interface_inventory',interfaces:Object.entries(nets).map(([name,items])=>({name,addresses:(items??[]).filter(x=>!x.internal).map(x=>({family:x.family,mac:x.mac}))}))};}
 else if(t.type==='dns_lookup'){const addresses=await dns.lookup(t.target,{all:true});result={kind:'allowlisted_dns_result',target:t.target,addresses:addresses.map(x=>x.address)};}
 t.status='SUCCEEDED';t.result=result;t.elapsedMs=+(performance.now()-start).toFixed(3);delivery.ok++;
 for(const id of t.recipients){const n=nodes[Number(id.slice(5))-1];n.taskReceipts++;n.packetsDelivered++;n.cycleCount=cycleCount;n.status='verified';}
 }catch(e){t.status='FAILED';t.error=String(e.message).slice(0,160);t.elapsedMs=+(performance.now()-start).toFixed(3);delivery.failed++;
 for(const id of t.recipients){const n=nodes[Number(id.slice(5))-1];n.packetsDropped++;n.status='error';}}
 const receipt={id:t.id,at:t.at,finishedAt:new Date().toISOString(),battalion:t.battalion,division:t.division,platoon:t.platoon,type:t.type,target:t.target,status:t.status,recipientCount:t.recipients.length,elapsedMs:t.elapsedMs,result:t.result,error:t.error};
 fs.appendFileSync(TASKS_PATH,JSON.stringify(receipt)+'\n',{mode:0o600});const proof=audit('task.'+t.status.toLowerCase(),{id:t.id,scope:t.battalion+'-'+t.division+'-'+t.platoon,recipientCount:t.recipients.length,type:t.type});receipt.ledger=proof;
 activeTasks.unshift(receipt);if(activeTasks.length>100)activeTasks.length=100;
 lastEvent={type:'task',timestamp:receipt.finishedAt,id:t.id,status:t.status};push({type:'task',receipt,summary:summary()});
}
let workerBusy=false;
async function drain(){if(workerBusy||!running||!queued.length)return;workerBusy=true;try{const t=queued.shift();await executeTask(t);}finally{workerBusy=false;}}
function equalToken(a,b){if(!a||!b)return false;const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&crypto.timingSafeEqual(x,y);}
function cookies(req){return Object.fromEntries((req.headers.cookie||'').split(';').map(x=>x.trim().split('=').slice(0,2)).filter(x=>x.length===2));}
function identify(req){const bearer=(req.headers.authorization||'').replace(/^Bearer\s+/i,'');if(equalToken(bearer,TOKEN))return {role:'admin',method:'token',name:'Local Gateway'};
 const cookie=cookies(req).nexus_session;const s=cookie&&sessions.get(cookie);if(s&&s.until>Date.now())return {...s,method:'github'};return null;}
function json(res,status,obj,headers={}){res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff',...headers});res.end(JSON.stringify(obj));}
function allowedOrigin(req){const origin=req.headers.origin;if(!origin)return null;return /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)?origin:null;}
function cors(req,res){const origin=allowedOrigin(req);if(origin){res.setHeader('access-control-allow-origin',origin);res.setHeader('access-control-allow-credentials','true');res.setHeader('vary','Origin');res.setHeader('access-control-allow-headers','Authorization, Content-Type, X-CSRF-Token');res.setHeader('access-control-allow-methods','GET,POST,OPTIONS');}return Boolean(!req.headers.origin||origin);}
async function bodyJson(req){let s='';for await(const c of req){s+=c.toString();if(s.length>16384)throw Error('Request exceeds 16 KB');}return s?JSON.parse(s):{};}
function safeSessionCookie(value,age){return `nexus_session=${encodeURIComponent(value)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${age}`;}
async function oauth(req,res,u){if(!OAUTH_READY)return json(res,503,{error:'GitHub OAuth requires NEXUS_GITHUB_CLIENT_ID/SECRET/ALLOWED_USERS'});
 if(u.pathname==='/auth/github'){
 const state=crypto.randomBytes(24).toString('hex');oauthPending.set(state,Date.now()+300000);
 res.writeHead(302,{'set-cookie':`nexus_oauth_state=${state}; HttpOnly; SameSite=Lax; Path=/auth; Max-Age=300`,'location':`https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(GITHUB_ID)}&redirect_uri=${encodeURIComponent(`http://127.0.0.1:${PORT}/auth/github/callback`)}&state=${state}&scope=read%3Auser`});res.end();return;}
 if(u.pathname==='/auth/github/callback'){
 const state=u.searchParams.get('state'),code=u.searchParams.get('code');const known=oauthPending.get(state);oauthPending.delete(state);if(!state||!code||!known||Date.now()>known||cookies(req).nexus_oauth_state!==state)return json(res,401,{error:'Invalid OAuth state'});
 const exchange=await fetch('https://github.com/login/oauth/access_token',{method:'POST',headers:{'content-type':'application/json','accept':'application/json'},body:JSON.stringify({client_id:GITHUB_ID,client_secret:GITHUB_SECRET,code,redirect_uri:`http://127.0.0.1:${PORT}/auth/github/callback`})});const et=await exchange.json();if(!et.access_token)throw Error('OAuth token exchange failed');
 const userResp=await fetch('https://api.github.com/user',{headers:{authorization:`Bearer ${et.access_token}`,'User-Agent':'NexusTelemetry/7','Accept':'application/vnd.github+json'}});const who=await userResp.json();if(!GITHUB_USERS.has(String(who.login??'').toLowerCase()))return json(res,403,{error:'GitHub user not on gateway allowlist'});
 const sid=crypto.randomBytes(32).toString('hex'),csrf=crypto.randomBytes(24).toString('hex');sessions.set(sid,{role:'admin',name:who.login,csrf,until:Date.now()+3600000});audit('gateway.github_login',{user:who.login});
 res.writeHead(200,{'set-cookie':[safeSessionCookie(sid,3600),'nexus_oauth_state=; HttpOnly; SameSite=Lax; Path=/auth; Max-Age=0'],'content-type':'text/html; charset=utf-8','cache-control':'no-store'});
 res.end('<!doctype html><meta charset="utf-8"><title>NEXUS Gateway</title><p>GitHub OAuth verified. Return to the TelemetryDashboard and select Check Session.</p>');return;
 }}
const server=http.createServer(async(req,res)=>{try{
 const u=new URL(req.url||'/',`http://${HOST}:${PORT}`),method=req.method||'GET';if(!cors(req,res))return json(res,403,{error:'Origin not permitted'});
 if(method==='OPTIONS'){res.writeHead(204);res.end();return;}
 if(u.pathname==='/health'&&method==='GET')return json(res,200,{service:'nexus-telemetry',ready:true,authentication:'required',version:'7.1.0'});
 if(u.pathname.startsWith('/auth/github')&&method==='GET')return await oauth(req,res,u);
 const user=identify(req);if(!user)return json(res,401,{error:'AUTH_REQUIRED'});
 if(method==='POST'&&user.method==='github'&&req.headers['x-csrf-token']!==user.csrf)return json(res,403,{error:'CSRF_REQUIRED'});
 if(u.pathname==='/api/state'&&method==='GET')return json(res,200,{metrics:current,samples,summary:summary(),clock:clock(),providers:providers.map(p=>({...p,status:(p.id===ASSISTANT_PROVIDER&&ASSISTANT_READY)?assistantState().status:p.status})),assistant:assistantState(),allowedTargets:[...TARGETS],battalions:BATTALIONS,divisions:DIVISIONS,tasks:activeTasks.slice(0,30),session:{name:user.name,method:user.method,csrf:user.csrf||null},source:{os:process.platform,network:'Linux /proc/net/dev when available'},gate:'AUTHORIZED'});
 if(u.pathname==='/api/nodes'&&method==='GET'){let filtered=nodes;const b=u.searchParams.get('battalion'),d=u.searchParams.get('division'),p=u.searchParams.get('platoon'),q=u.searchParams.get('q');if(b&&b!=='all')filtered=filtered.filter(x=>x.battalion===b);if(d&&d!=='all')filtered=filtered.filter(x=>x.division===d);if(p&&p!=='all')filtered=filtered.filter(x=>x.platoon===p);if(q)filtered=filtered.filter(x=>x.id.toLowerCase().includes(q.toLowerCase())||x.name.toLowerCase().includes(q.toLowerCase()));const count=filtered.length,offset=Math.max(0,Math.min(5999,Number(u.searchParams.get('offset')||0))),limit=Math.max(1,Math.min(100,Number(u.searchParams.get('limit')||40)));return json(res,200,{count,offset,limit,nodes:filtered.slice(offset,offset+limit)});}
 if(u.pathname==='/api/nodes/name'&&method==='POST'){
 const b=await bodyJson(req),id=String(b.id||''),name=String(b.name||'').trim();
 if(!/^NODE-\d{4}$/.test(id)||!nodes[Number(id.slice(5))-1])return json(res,400,{error:'Unknown node ID'});
 if(!/^[a-zA-Z0-9 _.-]{3,48}$/.test(name))return json(res,400,{error:'Name must be 3..48 safe characters'});
 if(nodes.some(n=>n.id!==id&&n.name.toLowerCase()===name.toLowerCase()))return json(res,409,{error:'Name already assigned'});
 const n=nodes[Number(id.slice(5))-1],old=n.name;n.name=name;const receipt=audit('node.name_changed',{id,old,new:name,method:'operator-approved'});
 push({type:'roster_change',node:id});return json(res,200,{id,name,ledger:receipt});
 }
 if(u.pathname==='/api/stream'&&method==='GET'){res.writeHead(200,{'content-type':'text/event-stream','cache-control':'no-cache, no-transform','connection':'keep-alive','x-accel-buffering':'no'});res.write(`data: ${JSON.stringify({type:'hello',summary:summary(),metrics:current,clock:clock()})}\n\n`);streams.add(res);req.on('close',()=>streams.delete(res));return;}
 if(u.pathname==='/api/assistant'&&method==='POST'){if(!ASSISTANT_READY)return json(res,503,{error:'No assistant configured'});try{return json(res,200,await assistantReply(await bodyJson(req)));}catch(e){return json(res,502,{error:String(e.message).slice(0,160)});}}
 if(u.pathname==='/api/dispatch'&&method==='POST'){if(!running)return json(res,409,{error:'Dispatch paused'});if(queued.length>100)return json(res,429,{error:'Task queue at capacity'});const task=taskSelect(await bodyJson(req));queued.push(task);audit('task.queued',{id:task.id,type:task.type,battalion:task.battalion,division:task.division,platoon:task.platoon,recipientCount:task.recipients.length});return json(res,202,{id:task.id,status:'QUEUED',recipients:task.recipients.length});}
 if(u.pathname==='/api/control'&&method==='POST'){const b=await bodyJson(req);if(b.action==='pause'){running=false;audit('control.pause');}else if(b.action==='resume'){running=true;audit('control.resume');}else if(b.action==='auto'){autoDispatch=Boolean(b.value);audit('control.auto',{autoDispatch});}else if(b.action==='reverify'){audit('control.reverify',{registered:nodes.length,paired:nodes.every(x=>nodes[Number(x.pairedAgent.slice(5))-1]?.pairedAgent===x.id)});}else return json(res,400,{error:'Unknown action'});push({type:'control',summary:summary()});return json(res,200,{summary:summary()});}
 if(u.pathname==='/api/audit'&&method==='GET'){const rows=fs.readFileSync(LEDGER_PATH,'utf8').trim().split('\n').filter(Boolean);let prev='0'.repeat(64),valid=true,seq=0;for(const line of rows){const rec=JSON.parse(line),{hash,...part}=rec;const computed=crypto.createHash('sha256').update(JSON.stringify(part)).digest('hex');if(rec.prev!==prev||computed!==hash||rec.seq!==++seq){valid=false;break;}prev=hash;}return json(res,200,{valid,entries:rows.length,hash:prev,receipts:activeTasks.slice(0,15)});}
 if(u.pathname==='/api/messages'&&method==='GET')return json(res,200,{messages:messages.slice(-50)});
 if(u.pathname==='/api/messages'&&method==='POST'){const b=await bodyJson(req),msg=String(b.text||'').trim();if(!msg||msg.length>1000)return json(res,400,{error:'Message length 1..1000'});const item={id:crypto.randomUUID(),at:new Date().toISOString(),from:user.name,text:msg};messages.push(item);if(messages.length>200)messages.shift();audit('comms.message',{id:item.id,length:msg.length});push({type:'message',message:item});return json(res,201,{message:item});}
 if(u.pathname==='/auth/logout'&&method==='POST'){const key=cookies(req).nexus_session;sessions.delete(key);res.setHeader('set-cookie',safeSessionCookie('',0));audit('gateway.logout',{method:user.method});return json(res,200,{ok:true});}
 return json(res,404,{error:'NOT_FOUND'});
 }catch(e){const status=e instanceof SyntaxError?400:/Invalid|allowlist|No matching|Request exceeds|Unknown/.test(String(e.message))?400:500;json(res,status,{error:String(e.message||e).slice(0,180)});}});
const messages=[];
function tick(){const now=performance.now();if(now>=nextTick){const missed=Math.max(1,Math.floor((now-nextTick)/100)+1);cycleCount+=missed;nextTick+=missed*100;clockDrift=now-(nextTick-100);phase=(cycleCount%3);}}
const tickTimer=setInterval(tick,15);tickTimer.unref();
const sampleTimer=setInterval(sample,1000);sampleTimer.unref();
const dispatchTimer=setInterval(()=>{void drain();},250);dispatchTimer.unref();
const autoTimer=setInterval(()=>{if(autoDispatch&&running&&queued.length<3){const b=BATTALIONS[Math.floor(seq++%3)];queued.push(taskSelect({taskType:'system_metrics',battalion:b}));audit('task.auto_queued',{battalion:b});}},12000);autoTimer.unref();
const hb=setInterval(()=>{for(const r of streams){try{r.write(': alive\n\n');}catch{streams.delete(r);}}for(const [k,v] of sessions)if(v.until<Date.now())sessions.delete(k);for(const [k,v] of oauthPending)if(v<Date.now())oauthPending.delete(k);},15000);hb.unref();
sample();audit('system.start',{registered:nodes.length,virtualPairs:3000,bind:`${HOST}:${PORT}`,networkMonitoring:'allowlisted_only'});
server.listen(PORT,HOST,()=>console.log(`NEXUS TDOC-12007 v7.0.0 | ${nodes.length} VIRTUAL slots | local gateway http://${HOST}:${PORT} | /health | no remote workers`));
process.on('SIGINT',()=>{audit('system.stop');server.close(()=>process.exit(0));});
process.on('SIGTERM',()=>{audit('system.stop');server.close(()=>process.exit(0));});