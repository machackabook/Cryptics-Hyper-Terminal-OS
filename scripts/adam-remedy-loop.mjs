#!/usr/bin/env node
/**
 * ADAM remediation scheduler: evaluates real verification evidence and produces
 * durable actionable remedy jobs. Does not invent proof or silently modify source.
 */
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,join} from 'node:path';
const base=resolve(process.env.ADAM_REPORT_DIR||'reports/golden-forge');
const read=async(name)=>JSON.parse(await readFile(join(base,name),'utf8'));
const sha=s=>createHash('sha256').update(s).digest('hex');
const now=new Date().toISOString();
const manifest=await read('agent-inventory.json');
const discovery=await read('discovery-receipt.json');
if(!Array.isArray(manifest.agents)||discovery.result!=='passed')throw Error('Missing/invalid DISCOVER evidence');
const previous=await read('remedy-pool.json').catch(e=>{if(e.code==='ENOENT')return {jobs:[]};throw e});
const jobsById=new Map((previous.jobs||[]).map(job=>[job.id,job]));
const required=[
 {gate:'VERIFY',name:'typecheck',command:'npm run lint',artifact:'reports/adam/verify-typecheck.json'},
 {gate:'VERIFY',name:'build',command:'npm run build',artifact:'reports/adam/verify-build.json'},
 {gate:'VERIFY',name:'security',command:'node scripts/verify.mjs',artifact:'reports/adam/verify-security.json'},
 {gate:'REVERIFY',name:'runtime-integration',command:'device adapter smoke test',artifact:'reports/adam/verify-runtime.json'}
];
for(const check of required){
 let evidence;
 try{evidence=await read('../adam/'+check.artifact.split('/').pop())}catch(e){if(e.code!=='ENOENT')throw e}
 if(evidence?.status==='passed'&&evidence?.commit===process.env.GITHUB_SHA)continue;
 const key=check.name+':'+(process.env.GITHUB_SHA||'local');
 const id='remedy-'+sha(key).slice(0,16);
 const existing=jobsById.get(id);
 jobsById.set(id,{
  id,gate:check.gate,check:check.name,verificationCommand:check.command,
  expectedEvidence:check.artifact,assignedRole:check.name==='runtime-integration'?'device-runtime-agent':'golden-forge-build-agent',
  status:existing?.status||'queued',attempts:existing?.attempts||0,maxAttempts:3,
  reason:evidence?'verification evidence not passing for current commit':'verification evidence missing',
  createdAt:existing?.createdAt||now,updatedAt:now,
  nextAction:'run verification, diagnose failure, propose patch, reverify; retain last verified release'
 });
}
const jobs=[...jobsById.values()].sort((a,b)=>a.id.localeCompare(b.id));
await mkdir(base,{recursive:true});
await writeFile(join(base,'remedy-pool.json'),JSON.stringify({schema:'adam-remedy-pool.v1',updatedAt:now,jobs},null,2)+'\n');
console.log(JSON.stringify({jobs:jobs.length,queued:jobs.filter(x=>x.status==='queued').length}));
