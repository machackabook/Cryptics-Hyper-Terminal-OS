import http from 'node:http';
import {randomUUID,randomBytes} from 'node:crypto';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {CapabilityGrants} from './gaia-capability-grants.mjs';

const secret=process.env.GAIA_LOCAL_TOKEN || randomBytes(24).toString('hex');
const grants=new CapabilityGrants();
const storage=path.join(os.homedir(),'.gaia-consent.json');
const records=new Map();
const recordKey=x=>JSON.stringify([x.user,x.device,x.capability]);
try {for(const x of JSON.parse(await readFile(storage,'utf8'))){if(Date.parse(x.expiresAt)>Date.now()){grants.grant(x);records.set(recordKey(x),x)}}}catch(e){if(e.code!=='ENOENT')throw e}
async function save(){await writeFile(storage,JSON.stringify([...records.values()]),{mode:0o600})}
const reply=(res,status,data)=>{res.writeHead(status,{'content-type':'application/json','cache-control':'no-store'});res.end(JSON.stringify(data))};
const server=http.createServer(async(req,res)=>{
 if(req.headers.origin && !['http://127.0.0.1:43187','http://localhost:3000','http://127.0.0.1:3000'].includes(req.headers.origin))return reply(res,403,{error:'Origin denied'});
 if(req.headers.origin){res.setHeader('access-control-allow-origin',req.headers.origin);res.setHeader('vary','Origin');res.setHeader('access-control-allow-headers','Authorization, Content-Type');res.setHeader('access-control-allow-methods','GET, POST, DELETE, OPTIONS')}
 if(req.method==='OPTIONS')return reply(res,204,{});
 if(req.headers.authorization!=='Bearer '+secret)return reply(res,401,{error:'Authentication required'});
 if(req.url==='/health'&&req.method==='GET')return reply(res,200,{service:'gaia-localhost',status:'ready',capabilities:['consent.grant','consent.revoke','consent.list']});
 if(req.url==='/agreements'&&req.method==='GET')return reply(res,200,{agreements:[...records.values()]});
 if(req.url!=='/agreements'||!['POST','DELETE'].includes(req.method))return reply(res,404,{error:'Not found'});
 let input='';for await(const part of req){input+=part;if(input.length>8192)return reply(res,413,{error:'Too large'})}
 try{
  const data=JSON.parse(input);
  if(req.method==='POST'){const agreement=grants.grant({...data,agreementId:randomUUID()});records.set(recordKey(agreement),agreement);await save();return reply(res,200,{agreement})}
  grants.revoke(data);records.delete(recordKey(data));await save();return reply(res,200,{revoked:true});
 }catch(e){return reply(res,400,{error:e.message})}
});
server.listen(43187,'127.0.0.1',()=>console.log('GAIA local consent service: http://127.0.0.1:43187; session token: '+secret));
