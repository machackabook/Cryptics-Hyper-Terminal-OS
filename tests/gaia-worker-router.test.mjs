import test from 'node:test';
import assert from 'node:assert/strict';
import {CAPABILITIES,resolveWorker,validateOperation,executeWithReceipt} from '../scripts/gaia-worker-router.mjs';
test('all intended adapters registered',()=>{
 for(const kind of ['playwright','stagehand','selenium','shiftedit','screenshare','sidepanel','ollama','gemini'])assert.ok(CAPABILITIES[kind]);
});
test('unauthorized and disabled workers never execute',()=>{
 const workers=[{id:'bad',kind:'playwright',authorized:false,enabled:true,capabilities:['browser.test']},
 {id:'good',kind:'playwright',authorized:true,enabled:true,capabilities:['browser.test']}];
 assert.equal(resolveWorker({capability:'browser.test'},workers)?.id,'good');
});
test('reject unsupported operations and missing authority',()=>{
 assert.throws(()=>validateOperation({id:'x',capability:'shell.root',authority:'device'}));
 assert.throws(()=>validateOperation({id:'x',capability:'browser.test'}));
});
test('missing worker becomes remedy receipt',async()=>{
 const receipt=await executeWithReceipt({id:'t1',capability:'browser.test',authority:'user'},[],()=>{throw Error('should not run')});
 assert.equal(receipt.status,'remedy_required');assert.equal(receipt.verified,false);
});
test('authorized execution completes without waiting for ADAM',async()=>{
 const workers=[{id:'local',kind:'ollama',authorized:true,enabled:true,capabilities:['model.infer']}];
 const receipt=await executeWithReceipt({id:'t2',capability:'model.infer',authority:'user'},workers,async()=>({ok:true}));
 assert.equal(receipt.status,'completed');assert.equal(receipt.certification,'not_recorded');
});
