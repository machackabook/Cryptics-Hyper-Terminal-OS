import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {join} from 'node:path';
const root=process.cwd();
const file=(name)=>readFile(join(root,name),'utf8');
test('entrypoint and critical React modules are tracked and readable',async()=>{
 for (const f of ['index.html','src/App.tsx','src/main.tsx','src/components/modules/TelemetryDashboard.tsx','tsconfig.json','vite.config.ts']){
  await access(join(root,f));
 }
});
test('frontend has actual build and typecheck scripts',async()=>{
 const pkg=JSON.parse(await file('package.json'));
 assert.match(pkg.scripts?.lint||'',/tsc/);
 assert.match(pkg.scripts?.build||'',/vite/);
 assert.equal(pkg.type,'module');
});
test('release documentation labels crawler access as non-authorization',async()=>{
 const doc=await file('AI-ACCESS-POLICY.md');
 assert.match(doc,/robots\.txt/i);
 assert.match(doc,/not.{0,50}(security|auth|origin|access)/i);
});
test('frontend code does not hardcode known private-key formats',async()=>{
 const files=['src/App.tsx','src/main.tsx','src/components/modules/TelemetryDashboard.tsx'];
 const leak=/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|sk-proj-[A-Za-z0-9_-]{20,}|ghp_[A-Za-z0-9]{35,}/;
 for(const f of files)assert.equal(leak.test(await file(f)),false,f);
});
