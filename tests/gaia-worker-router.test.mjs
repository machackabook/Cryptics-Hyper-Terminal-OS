import {CapabilityGrants} from '../scripts/gaia-capability-grants.mjs';
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
 assert.equal(receipt.status,'remedy_required');assert.equal(receipt.certification,'not_recorded');
});
test('authorized execution completes without waiting for ADAM',async()=>{
 const workers=[{id:'local',kind:'ollama',authorized:true,enabled:true,capabilities:['model.infer']}];
 const grants=new CapabilityGrants();
 grants.grant({user:'alice',device:'local',capability:'model.infer',agreementId:'agreement-1',expiresAt:new Date(Date.now()+60000).toISOString()});
 const receipt=await executeWithReceipt({id:'t2',capability:'model.infer',authority:'user',user:'alice',device:'local'},workers,async()=>({ok:true}),grants);
 assert.equal(receipt.status,'completed');assert.equal(receipt.certification,'not_recorded');
});

test('optional feature requires explicit user agreement and supports revocation',async()=>{
 const workers=[{id:'panel',kind:'sidepanel',authorized:true,enabled:true,capabilities:['panel.context']}];
 const grants=new CapabilityGrants();
 const op={id:'panel-1',capability:'panel.context',authority:'user',user:'alice',device:'chromebook'};
 let calls=0;
 const exec=async()=>{calls++;return {ok:true}};
 assert.equal((await executeWithReceipt(op,workers,exec,grants)).status,'consent_required');
 grants.grant({user:'alice',device:'chromebook',capability:'panel.context',agreementId:'user-opt-in',expiresAt:new Date(Date.now()+60000).toISOString()});
 assert.equal((await executeWithReceipt(op,workers,exec,grants)).status,'completed');
 assert.equal((await executeWithReceipt({...op,user:'bob'},workers,exec,grants)).status,'consent_required');
 grants.revoke(op);
 assert.equal((await executeWithReceipt(op,workers,exec,grants)).status,'consent_required');
 assert.equal(calls,1);
});
