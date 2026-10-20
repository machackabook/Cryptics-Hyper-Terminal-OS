import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * HyperTerminal Polyglot Quine OS — operator-hosted application gateway.
 * No invented provider balances, transactions, API keys, account authorizations,
 * or successful charges. External adapters must implement authenticated contracts.
 */
const providers = ['gemini', 'aeon', 'stripe', 'cashapp', 'axs', 'adb'] as const;

function securityHeaders(_req: express.Request, res: express.Response, next: express.NextFunction) {
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Referrer-Policy','no-referrer');
  res.setHeader('Cache-Control','no-store');
  next();
}

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(securityHeaders);
  app.use(express.json({limit:'32kb',strict:true}));

  const notConfigured=(capability:string)=>({
    success:false,ok:false,status:'NOT_CONFIGURED',capability,
    error:'Authenticated '+capability+' provider adapter is not connected. No external operation was executed.'
  });
  // Actual server response, not a heuristic based on env variable names.
  app.get('/api/health',(_req,res)=>res.json({
    ok:true,service:'HyperTerminal Polyglot Gateway',runtime:'node',
    providersVerified:0,externalOperationsExecuted:0
  }));
  app.get('/api/capabilities',(_req,res)=>res.json({
    ok:true,service:'HyperTerminal Polyglot Gateway',
    providerStatus:Object.fromEntries(providers.map(name=>[name,'NOT_CONFIGURED'])),
    browserShell:'AVAILABLE',nativeExecution:'NOT_CONFIGURED',
    aiInference:'NOT_CONFIGURED',paymentWrites:'DISABLED',researchAcceleration:'UNVERIFIED'
  }));

  app.get('/api/payment/accounts',(_req,res)=>res.status(503).json({...notConfigured('payment.accounts'),accounts:[]}));
  app.get('/api/payment/transactions',(_req,res)=>res.status(503).json({...notConfigured('payment.transactions'),transactions:[]}));
  app.post('/api/payment/stripe/charge',(_req,res)=>res.status(501).json(notConfigured('stripe.charge')));
  app.post('/api/payment/cashapp/transfer',(_req,res)=>res.status(501).json(notConfigured('cashapp.transfer')));
  app.post('/api/ai/:provider/generate',(req,res)=>{
    const provider=String(req.params.provider||'').toLowerCase();
    if(!['gemini','aeon'].includes(provider))return res.status(404).json({ok:false,status:'UNKNOWN_PROVIDER'});
    return res.status(501).json(notConfigured('ai.'+provider));
  });
  return app;
}

async function startServer() {
  const app = createApp();
  const PORT = Number(process.env.PORT || 3000);
  const HOST = process.env.CRYPTIC_HOST || '127.0.0.1';
  if(!Number.isInteger(PORT)||PORT<1||PORT>65535)throw new Error('Invalid PORT');
  if(!['127.0.0.1','::1','localhost'].includes(HOST)){
    throw new Error('Refusing to bind an unauthenticated development gateway outside loopback.');
  }
  if(process.env.NODE_ENV==='production'){
    app.use(express.static(path.join(__dirname,'dist')));
    app.get('*',(_req,res)=>res.sendFile(path.join(__dirname,'dist','index.html')));
  }else{
    const vite=await createViteServer({server:{middlewareMode:true},appType:'spa'});
    app.use(vite.middlewares);
  }
  app.listen(PORT,HOST,()=>{
    console.log('HyperTerminal Polyglot OS: http://'+HOST+':'+PORT);
    console.log('Provider adapters are NOT_CONFIGURED unless independently verified.');
  });
}
if(process.argv[1] && path.resolve(process.argv[1]) === __filename){
  startServer().catch(e=>{console.error(e);process.exitCode=1});
}
