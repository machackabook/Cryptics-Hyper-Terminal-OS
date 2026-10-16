import unittest,os,subprocess,urllib.request,urllib.error,json,socket,time,secrets,tempfile
class Runtime(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.token=secrets.token_hex(32)
  sock=socket.socket();sock.bind(('127.0.0.1',0));cls.port=sock.getsockname()[1];sock.close()
  cls.tmp=tempfile.TemporaryDirectory()
  env=os.environ.copy();env.update(NEXUS_GATEWAY_TOKEN=cls.token,NEXUS_PORT=str(cls.port),NEXUS_DATA_DIR=cls.tmp.name)
  cls.proc=subprocess.Popen(['node','telemetry/server.mjs'],stdout=subprocess.DEVNULL,stderr=subprocess.PIPE,env=env)
  for _ in range(50):
   try:
    urllib.request.urlopen('http://127.0.0.1:%d/health'%cls.port,timeout=.2)
    break
   except Exception: time.sleep(.1)
 @classmethod
 def tearDownClass(cls):
  cls.proc.terminate()
  try: cls.proc.wait(timeout=3)
  except subprocess.TimeoutExpired: cls.proc.kill()
  cls.tmp.cleanup()
 def request(self,path,authorized=True):
  req=urllib.request.Request('http://127.0.0.1:%d'%self.port+path,headers={'Authorization':'Bearer '+self.token} if authorized else {})
  try:
   with urllib.request.urlopen(req,timeout=3) as r:return r.status,json.load(r)
  except urllib.error.HTTPError as e:return e.code,json.load(e)
 def test_rejects_unauthed(self):
  status,_=self.request('/api/state',False);self.assertEqual(status,401)
 def test_real_state_hierarchy(self):
  status,s=self.request('/api/state');self.assertEqual(status,200)
  self.assertEqual(s['summary']['registered'],6000);self.assertEqual(s['summary']['pairs'],3000)
  self.assertIn('cpuPercent',s['metrics'])
 def test_denied_invalid(self):
  status,_=self.request('/api/private/executecmd');self.assertEqual(status,404)
if __name__=='__main__':unittest.main()
