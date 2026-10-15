// Pure virtual namespace contract; not SSH authentication or a live mount.
export const VIRTUAL_ROOT='nexus://mesh/a15/files';
const part=/^[A-Za-z0-9][A-Za-z0-9._ -]{0,127}$/;
export function checkedVirtualPath(location){
 if(typeof location!=='string'||(location!==VIRTUAL_ROOT&&!location.startsWith(VIRTUAL_ROOT+'/')))throw Error('NOT_IN_MOUNT_NAMESPACE');
 const suffix=location.slice(VIRTUAL_ROOT.length);
 if(!suffix)return [];
 const parts=suffix.slice(1).split('/');
 if(parts.length>24||suffix.length>1024||parts.some(v=>!part.test(v)||v==='.'||v==='..'||v.includes('..')||v.includes('%')))throw Error('PATH_TRAVERSAL_BLOCKED');
 return parts;
}
export function parentVirtualPath(location){
 const parts=checkedVirtualPath(location);
 return parts.length>1?VIRTUAL_ROOT+'/'+parts.slice(0,-1).join('/'):VIRTUAL_ROOT;
}
export function childVirtualPath(location,name){
 const parts=checkedVirtualPath(location);
 if(typeof name!=='string'||!part.test(name)||name==='.'||name==='..'||name.includes('..')||name.includes('%')||parts.length>=24)throw Error('PATH_TRAVERSAL_BLOCKED');
 return VIRTUAL_ROOT+'/'+[...parts,name].join('/');
}
