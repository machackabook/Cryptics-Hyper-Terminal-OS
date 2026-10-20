import React, {useCallback,useEffect,useState} from 'react';
import {FolderSearch,RefreshCw,HardDrive,ExternalLink} from 'lucide-react';

type Archive={id:string;name:string;rootId:string;bandsId:string;driveUrl:string;source:string};
type Entry={name:string;isDir:boolean;sizeBytes:number|null;modifiedAt:string|null};
type Catalog={ok:boolean;status:string;hostAuthConfigured:boolean;physicalMount:string;archiveRegistry:Archive[]};
type Listing={ok?:boolean;status:string;files?:Entry[];totalReturned?:number;truncated?:boolean;physicalMount?:string;error?:string};

/**
 * The Cloud Index and a mounted filesystem are different capabilities.
 * Only a real rclone call may transition a root to DIRECTORY_LISTED.
 * The filesystem remains UNVERIFIED until a host-side native attach occurs.
 */
export const EnclaveHttpfsMount:React.FC=()=>{
  const [catalog,setCatalog]=useState<Catalog|null>(null);
  const [loading,setLoading]=useState(false);
  const [notice,setNotice]=useState('');
  const [listings,setListings]=useState<Record<string,Listing>>({});
  const [openId,setOpenId]=useState<string|null>(null);
  const [section,setSection]=useState<'root'|'bands'>('root');
  const refresh=useCallback(async()=>{
    setLoading(true);
    try{
      const response=await fetch('/api/enclaves',{cache:'no-store'});
      const body=await response.json();
      if(!response.ok)throw new Error(String(body.status||response.status));
      setCatalog(body);
      setNotice(body.hostAuthConfigured?'Host rclone adapter configured; click a directory to test actual access.':'Discovery index loaded. Host rclone/OAuth not configured; files are NOT mounted.');
    }catch{setNotice('Backend unavailable. No Drive or filesystem connection verified.')}
    finally{setLoading(false)}
  },[]);
  useEffect(()=>{void refresh()},[refresh]);
  const scan=async(id:string,part:'root'|'bands')=>{
    if(!catalog?.hostAuthConfigured){setNotice('NOT_CONFIGURED: host must authenticate rclone independently of the ChatGPT Drive connector.');return}
    setLoading(true);setOpenId(id);setSection(part);
    try{
      const res=await fetch('/api/enclaves/'+encodeURIComponent(id)+'/list?section='+part,{cache:'no-store'});
      const data=await res.json() as Listing;
      setListings(v=>({...v,[id+':'+part]:data}));
      setNotice(res.ok?'Provider directory read completed; no disk image was mounted.':(data.status||'ERROR')+' — '+(data.error||'Provider unreadable'));
    }catch{setNotice('HTTPFS provider unreachable; no mount occurred.')}
    finally{setLoading(false)}
  };
  return <section aria-label="Google Drive Sparsebundle Virtual Mount" className="p-3 border border-cyan-900/60 rounded-xl bg-[#041020] text-slate-200 font-mono text-xs space-y-3">
    <header className="flex items-center justify-between flex-wrap gap-2">
      <div><h3 className="text-cyan-300 font-bold tracking-wide flex items-center gap-2"><HardDrive className="w-4 h-4"/>ENCLAVE HTTPFS · READ-ONLY</h3>
        <p className="text-[10px] text-slate-400">Provider folder → verified directory listing → host-side native sparsebundle attach</p>
      </div>
      <button onClick={()=>void refresh()} disabled={loading} className="border border-cyan-800 rounded px-3 py-1 flex gap-1 items-center disabled:opacity-40"><RefreshCw className="w-3 h-3"/>Refresh</button>
    </header>
    <div className="text-[10px] text-amber-200 border border-amber-800/50 bg-amber-950/20 p-2 rounded" role="status">
      {notice||'Checking localhost gateway…'}<div className="mt-1 text-slate-400">
        API: {catalog?.status||'UNKNOWN'} · Disk filesystem: {catalog?.physicalMount||'UNVERIFIED'} · No live arbitrary commands
      </div>
    </div>
    {(catalog?.archiveRegistry||[]).map(a=>{
      const details=listings[a.id+':'+section];
      return <div key={a.id} className="border border-slate-800 rounded-lg p-2">
        <div className="flex items-center gap-2 flex-wrap justify-between">
          <div><strong className="text-cyan-200">{a.name}</strong>
            <p className="text-[10px] text-slate-400">Drive metadata found; source: {a.source}. Native mount: NOT VERIFIED.</p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <a href={a.driveUrl} target="_blank" rel="noopener noreferrer" className="text-amber-300 underline flex items-center gap-1">Drive <ExternalLink className="w-3 h-3"/></a>
            <button disabled={loading} onClick={()=>void scan(a.id,'root')} className="border border-cyan-800 px-2 py-1 rounded disabled:opacity-40">Directory</button>
            <button disabled={loading} onClick={()=>void scan(a.id,'bands')} className="border border-cyan-800 px-2 py-1 rounded disabled:opacity-40">Bands</button>
          </div>
        </div>
        {openId===a.id&&details?.ok&&<div className="mt-2 border-t border-slate-800 pt-2">
          <p className="mb-1 text-emerald-300 flex gap-1 items-center"><FolderSearch className="w-3 h-3"/>
            {section.toUpperCase()} listing: {details.totalReturned} items {details.truncated?'(truncated)':''} · not APFS contents
          </p>
          <div className="max-h-40 overflow-y-auto bg-black/30 rounded p-1 space-y-0.5">
            {(details.files||[]).slice(0,100).map(e=><div key={e.name} className="flex gap-3">
              <span className="truncate flex-1">{e.isDir?'📂 ':'◻ '}{e.name}</span>
              <span className="text-slate-500">{e.isDir?'DIR':e.sizeBytes==null?'UNKNOWN':e.sizeBytes.toLocaleString()+' B'}</span>
            </div>)}
            {(details.files?.length||0)>100&&<p className="text-amber-200">First 100 shown; full metadata count available from API.</p>}
          </div>
        </div>}
      </div>;
    })}
    <p className="text-slate-400 text-[10px]">A real APFS/HFS+ mount needs all numbered bands, a valid Info.plist, and a host capable of attaching that disk-image format. A Google Drive folder alone is not an APFS filesystem.</p>
  </section>;
};
