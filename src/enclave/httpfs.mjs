/**
 * Enclave HTTPFS registry — exact, read-only Google Drive folder roots.
 * IDs were discovered by an external, user-authorized Drive inspection.
 * This registry is NOT proof that the deployment's Drive OAuth is connected.
 * A directory named "*.sparsebundle" is not a mounted disk image.
 */
import {promisify} from 'node:util';
import {execFile} from 'node:child_process';
const run=promisify(execFile);
const source='GOOGLE_DRIVE_METADATA_DISCOVERY_2026-10-20';
const rows=[
 {id:'chimera',name:'ChimeraSystem.sparsebundle',rootId:'1iCMrVNvBC_PKdfjSwt_2dwrWqHA7REy9',bandsId:'1fvmoghV-ceqSqfeM8f-QMN9PwXgUf6bL'},
 {id:'synapse',name:'Synapse.sparsebundle',rootId:'1IOMTN5BSstsiKheAAfpKwcrplgc0kU2v',bandsId:'1P3Fk-FqyaUPvhtq92dHFcM2Dl5aFtnJX'},
 {id:'nexus',name:'Nexus.sparsebundle',rootId:'1u82FTrp-d3ZPLwzjG5DGLqu12Amh4XEm',bandsId:'1au3W3GEciAdje2CNuNoVEpgBjABIBVwJ'}
];
export const ENCLAVE_REGISTRY=Object.freeze(rows.map(x=>Object.freeze({...x,source,driveUrl:'https://drive.google.com/drive/folders/'+x.rootId})));
export function getEnclave(id){
 return ENCLAVE_REGISTRY.find(x=>x.id===id)||null;
}
export function catalogStatus(env=process.env){
 const remote=String(env.NEXUS_RCLONE_REMOTE||'');
 const configured=env.NEXUS_ENCLAVE_HTTPFS_ENABLED==='true'&&/^[a-zA-Z][a-zA-Z0-9._-]{0,63}$/.test(remote);
 return {
  ok:true,status:configured?'CATALOG_ADAPTER_CONFIGURED_NOT_YET_PROBED':'DISCOVERY_ONLY',
  mountedVolumes:0,hostAuthConfigured:configured,serverSideTransport:'RCLONE_GOOGLE_DRIVE',
  physicalMount:'UNVERIFIED',filesystemContents:'UNVERIFIED',
  archiveRegistry:ENCLAVE_REGISTRY
 };
}
function safeEntry(f){
 if(!f||typeof f!=='object'||typeof f.Name!=='string')return null;
 const name=f.Name.slice(0,256);
 if(!name||name==='.'||name==='..'||name.includes('/')||name.includes('\\'))return null;
 return {name,isDir:!!f.IsDir,sizeBytes:Number.isSafeInteger(f.Size)&&f.Size>=0?f.Size:null,
         modifiedAt:typeof f.ModTime==='string'?f.ModTime:null};
}
export async function listRemoteEnclave(id,section='root',{env=process.env,exec=run}={}){
 const archive=getEnclave(id);
 if(!archive)throw Object.assign(new Error('unknown_enclave'),{code:'UNKNOWN_ENCLAVE'});
 if(!['root','bands'].includes(section))throw Object.assign(new Error('invalid_section'),{code:'INVALID_SECTION'});
 const status=catalogStatus(env);
 if(!status.hostAuthConfigured)throw Object.assign(new Error('rclone_connection_not_configured'),{code:'NOT_CONFIGURED'});
 const remote=String(env.NEXUS_RCLONE_REMOTE);
 const folderId=section==='root'?archive.rootId:archive.bandsId;
 const target=remote+',root_folder_id='+folderId+':';
 let stdout;
 try{
  ({stdout}=await exec('rclone',['lsjson',target,'--max-depth','1'],{
   timeout:25000,maxBuffer:8*1024*1024,windowsHide:true,encoding:'utf8'
  }));
 }catch(e){
  throw Object.assign(new Error('rclone_listing_failed'),{code:'PROVIDER_UNAVAILABLE'});
 }
 let raw;
 try{raw=JSON.parse(stdout)}catch{
   throw Object.assign(new Error('invalid_rclone_listing'),{code:'BAD_PROVIDER_DATA'});
 }
 if(!Array.isArray(raw))throw Object.assign(new Error('invalid_rclone_shape'),{code:'BAD_PROVIDER_DATA'});
 const entries=raw.map(safeEntry).filter(Boolean);
 return {ok:true,status:'DRIVE_DIRECTORY_LISTED',archive:archive.id,
     source:'HOST_AUTHENTICATED_RCLONE',section,files:entries.slice(0,1000),
     totalReturned:entries.length,truncated:entries.length>1000,physicalMount:'UNVERIFIED',
     includesFilesystemContent:false};
}
