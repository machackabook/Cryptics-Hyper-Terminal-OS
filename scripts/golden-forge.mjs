#!/usr/bin/env node
// Golden Forge: real source discovery, fingerprinting, deterministic agent inventory.
// Writes only into a designated output directory. No code execution, deployment, or mutation of sources.
import {readdir,readFile,mkdir,writeFile} from 'node:fs/promises';
import {join,relative,resolve,sep} from 'node:path';
import {createHash} from 'node:crypto';
const root=resolve(process.cwd());
const out=resolve(process.env.FORGE_OUTPUT_DIR||'reports/golden-forge');
if(out===root||!out.startsWith(root+sep))throw Error('Output must be a subdirectory of repository');
const allowed=new Set(['.ts','.tsx','.js','.jsx','.mjs','.cjs','.py','.rs','.sh','.json','.yml','.yaml','.html','.css']);
const excluded=new Set(['.git','node_modules','dist','build','coverage','reports','.next','.cache']);
const paths=[];
async function scan(dir,depth=0){
 if(depth>12)throw Error('Directory depth limit exceeded');
 for(const entry of await readdir(dir,{withFileTypes:true})){
  if(entry.isSymbolicLink())continue;
  const full=join(dir,entry.name),name=relative(root,full).split(sep).join('/');
  if(entry.isDirectory()){if(!excluded.has(entry.name))await scan(full,depth+1)}
  else if(entry.isFile()&&allowed.has(entry.name.slice(entry.name.lastIndexOf('.'))))paths.push(name);
  if(paths.length>100000)throw Error('File inventory limit exceeded');
 }
}
await scan(root);paths.sort();
const records=[];
for(const path of paths){
 const content=await readFile(join(root,path));
 if(content.byteLength>8*1024*1024)continue;
 const fingerprint=createHash('sha256').update(content).digest('hex');
 // Stable identity derives from path; collisions are detected and reported, not silently merged.
 const stableId=createHash('sha256').update(path).digest('hex').slice(0,20);
 records.push({id:'agent-'+stableId,sourcePath:path,fingerprint,bytes:content.length,
   kind:path.startsWith('src/')?'application-source':path.startsWith('scripts/')?'automation-source':'repository-source',
   owner:'golden-forge',state:'discovered',verifiedRuntime:false});
}
const ids=new Set(records.map(r=>r.id));if(ids.size!==records.length)throw Error('Agent identity collision');
const manifest={schema:'golden-forge.v1',repository:process.env.GITHUB_REPOSITORY||'local',
 revision:process.env.GITHUB_SHA||'local',createdAt:new Date().toISOString(),count:records.length,
 scope:'source-file discovery; not live processes',agents:records};
await mkdir(out,{recursive:true});
await writeFile(join(out,'agent-inventory.json'),JSON.stringify(manifest,null,2)+'\n');
const evidence={schema:'adam-proof.v1',gate:'DISCOVER',result:'passed',discovered:records.length,
 verifiedRuntime:false,automatedDeployment:false,sha256:createHash('sha256').update(JSON.stringify(manifest)).digest('hex')};
await writeFile(join(out,'discovery-receipt.json'),JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify({result:'passed',count:records.length,output:out,gate:'DISCOVER'}));
