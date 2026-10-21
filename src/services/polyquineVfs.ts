export type Node = { type: 'file'|'directory'; content?: string; children?: Record<string, Node>; modified: number };
const KEY = 'hyperterminal_polyglot_vfs_v3';
const directory = (): Node => ({type:'directory',children:Object.create(null),modified:Date.now()});
const seed = (): Node => {
  const root=directory();
  root.children!['root']=directory();
  root.children!['etc']=directory();
  root.children!['var']=directory();
  root.children!['var'].children!['log']=directory();
  root.children!['root'].children!['welcome.txt']={type:'file',content:'HYPERTERMINAL POLYGLOT QUINE OS\nType help to see actual available commands.\nBrowser VFS only: not the host filesystem.\n',modified:Date.now()};
  return root;
};
export class PolyquineVfs {
  private root:Node;
  constructor(){try{const data=localStorage.getItem(KEY);this.root=data?JSON.parse(data):seed();if(this.root.type!=='directory')throw Error('invalid root')}catch{this.root=seed()}}
  normalize(cwd:string,target='.') {const parts=(target.startsWith('/')?target:cwd+'/'+target).split('/');const out:string[]=[];for(const p of parts){if(!p||p==='.')continue;if(p==='..')out.pop();else if(p==='__proto__'||p==='prototype'||p==='constructor')throw Error('Forbidden path segment');else out.push(p)}return '/'+out.join('/')}
  private resolve(path:string):Node{let current=this.root;for(const name of path.split('/').filter(Boolean)){if(current.type!=='directory'||!Object.prototype.hasOwnProperty.call(current.children??{},name))throw Error('No such file or directory: '+path);current=current.children![name]}return current}
  private persist(){localStorage.setItem(KEY,JSON.stringify(this.root))}
  ls(cwd:string,path='.'){const p=this.normalize(cwd,path),node=this.resolve(p);return node.type==='file'?[p.split('/').pop()]:Object.entries(node.children??{}).map(([name,child])=>child.type==='directory'?name+'/':name).sort()}
  cd(cwd:string,path='/root'){const p=this.normalize(cwd,path);if(this.resolve(p).type!=='directory')throw Error('Not a directory');return p}
  cat(cwd:string,path:string){const node=this.resolve(this.normalize(cwd,path));if(node.type!=='file')throw Error('Is a directory');return node.content??''}
  mkdir(cwd:string,target:string){const p=this.normalize(cwd,target),parts=p.split('/').filter(Boolean);let current=this.root;for(const part of parts){if(current.type!=='directory')throw Error('Not a directory');if(!Object.prototype.hasOwnProperty.call(current.children??{},part))current.children![part]=directory();current=current.children![part]}if(current.type!=='directory')throw Error('File exists');this.persist();return p}
  write(cwd:string,path:string,content:string,append=false){const p=this.normalize(cwd,path),parts=p.split('/').filter(Boolean),name=parts.pop();if(!name)throw Error('Cannot write root');const parent=this.resolve('/'+parts.join('/'));if(parent.type!=='directory')throw Error('Parent is not a directory');const old=parent.children![name];if(old?.type==='directory')throw Error('Cannot overwrite directory');parent.children![name]={type:'file',content:(append?old?.content??'':'')+content,modified:Date.now()};this.persist();return p}
  rm(cwd:string,path:string){const p=this.normalize(cwd,path);if(['/','/root','/etc','/var','/var/log'].includes(p))throw Error('Protected directory');const parts=p.split('/').filter(Boolean),key=parts.pop()!,parent=this.resolve('/'+parts.join('/'));if(!Object.prototype.hasOwnProperty.call(parent.children??{},key))throw Error('No such file');delete parent.children![key];this.persist()}
  export(){return JSON.stringify({format:'polyquine-vfs-v3',snapshot:this.root,created:new Date().toISOString()},null,2)}
}
export const polyquineVfs=new PolyquineVfs();
