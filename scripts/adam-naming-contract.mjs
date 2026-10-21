#!/usr/bin/env node
// Canonical names and required workflow wiring: fail loudly with actionable details.
import {readFile,access} from 'node:fs/promises';
const required={
 'golden-forge':'scripts/golden-forge.mjs',
 'adam-remedy':'scripts/adam-remedy-loop.mjs',
 'github-failure':'scripts/github-failure-intake.mjs'
};
const workflows=[
 '.github/workflows/golden-forge.yml',
 '.github/workflows/adam-remedy-loop.yml',
 '.github/workflows/adam-github-failure-intake.yml'
];
let failures=0;
for(const [name,path] of Object.entries(required)){
 try{await access(path);console.log('OK',name,path)}
 catch{console.error('MISSING',name,path);failures++}
}
for(const path of workflows){
 try{
  const text=await readFile(path,'utf8');
  const referenced=[...text.matchAll(/node\s+(scripts\/[\w./-]+\.mjs)/g)].map(m=>m[1]);
  for(const file of referenced){try{await access(file)}catch{console.error('BROKEN WORKFLOW REFERENCE',path,file);failures++}}
  if(!/schedule:/.test(text))console.warn('NOTICE no schedule',path);
  console.log('OK workflow',path,'scripts',referenced.length);
 }catch{console.error('MISSING WORKFLOW',path);failures++}
}
if(failures){console.error('ADAM naming remediation required:',failures);process.exitCode=1}
else console.log('ADAM naming contract verified');
