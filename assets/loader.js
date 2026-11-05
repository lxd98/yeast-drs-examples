'use strict';
(async()=>{
 const assetBase=new URL('.',document.currentScript.src),status=document.getElementById('loadStatus');
 const fail=e=>{status.hidden=false;status.textContent='Unable to load this view: '+e.message;console.error(e);};
 window.IGV_LOAD_ERROR=fail;
 try{
 const bytes=b64=>Uint8Array.from(atob(b64),c=>c.charCodeAt(0));
 const unpack=async b64=>JSON.parse(await new Response(new Blob([bytes(b64)]).stream().pipeThrough(new DecompressionStream('gzip'))).text());
 const data=await unpack(window.IGV_PACKED);delete window.IGV_PACKED;
 const raw=bytes(data.records),dv=new DataView(raw.buffer);delete data.records;
 for(const kind of ['start5','end3']){const x=bytes(data.densities[kind].packed);data.densities[kind].y=Array.from(new Float64Array(x.buffer));delete data.densities[kind].packed;}
 const groups=['Group1','Group2','Uncertain'],cache=new Map(),inflight=new Map(),waiting=new Map(),chunkSize=data.chunkSize,hex=Array.from({length:256},(_,i)=>i.toString(16).padStart(2,'0'));
 function chunkOf(rank){return Math.floor(rank/chunkSize);}
 function detail(rank){return cache.get(chunkOf(rank))?.[rank%chunkSize];}
 window.IGV_REGISTER_CHUNK=async(index,payload)=>{const entry=waiting.get(index);if(!entry)return;try{const rows=await unpack(payload);for(const row of rows){const flat=row[1],blocks=[];for(let j=0;j<flat.length;j+=3)blocks.push([flat[j],flat[j+1],flat[j+2]]);row[1]=blocks;}cache.set(index,rows);while(cache.size>8)cache.delete(cache.keys().next().value);entry.resolve(rows);}catch(e){entry.reject(e);}finally{waiting.delete(index);entry.script.remove();}};
 function loadChunk(index){if(cache.has(index)){const v=cache.get(index);cache.delete(index);cache.set(index,v);return Promise.resolve(v);}if(inflight.has(index))return inflight.get(index);const promise=new Promise((resolve,reject)=>{const script=document.createElement('script');waiting.set(index,{resolve,reject,script});script.src='read_chunks/chunk_'+String(index).padStart(5,'0')+'.js';script.onerror=()=>{waiting.delete(index);script.remove();reject(new Error('Read chunk '+index+' could not be loaded.'));};document.head.append(script);}).finally(()=>inflight.delete(index));inflight.set(index,promise);return promise;}
 class Read{
  constructor(rank){this.rank=rank;}
  get id(){const offset=this.rank*40;let s='';for(let j=0;j<16;j++)s+=hex[raw[offset+j]];return s.slice(0,8)+'-'+s.slice(8,12)+'-'+s.slice(12,16)+'-'+s.slice(16,20)+'-'+s.slice(20);}
  get strand(){return data.strand;}get start5(){return dv.getInt32(this.rank*40+16,true);}get end3(){return dv.getInt32(this.rank*40+20,true);}get mapq(){return raw[this.rank*40+24];}
  get type(){return raw[this.rank*40+25]&1?'supplementary':'primary';}get tss25(){return Boolean(raw[this.rank*40+25]&2);}get sequenceMatch(){return Boolean(raw[this.rank*40+25]&4);}
  get tail(){return raw[this.rank*40+25]&8?dv.getFloat64(this.rank*40+28,true):null;}get group(){return groups[raw[this.rank*40+26]];}get structuralClass(){return ['internal_end','coding_end_or_downstream','uncertain'][raw[this.rank*40+26]];}
  get endGroup(){return data.endGroups[dv.getUint32(this.rank*40+36,true)];}get blocks(){return detail(this.rank)?.[1]||[];}get cigar(){return detail(this.rank)?.[0]||'';}
 }
 data.reads=Array.from({length:data.readCount},(_,i)=>new Read(i));
 data.hasGeometry=r=>cache.has(chunkOf(r.rank));
 data.ensureGeometry=reads=>Promise.all([...new Set(reads.map(r=>chunkOf(r.rank)))].map(loadChunk));
 data.filteredCoverage=async(reads,isCurrent,progress)=>{const diff=new Int32Array(data.window[1]-data.window[0]+2),byChunk=new Map();for(const r of reads){const i=chunkOf(r.rank);if(!byChunk.has(i))byChunk.set(i,[]);byChunk.get(i).push(r.rank%chunkSize);}let done=0;for(const [index,offsets]of byChunk){if(!isCurrent())return null;const rows=await loadChunk(index);for(const offset of offsets)for(const[a,b,k]of rows[offset][1])if(k<3){diff[a-data.window[0]]++;diff[b-data.window[0]+1]--;}progress(++done,byChunk.size);if(done%4===0)await new Promise(r=>setTimeout(r,0));}let n=0;return Array.from(diff.slice(0,-1),v=>n+=v);};
 window.IGV_DATA=data;status.hidden=true;
 const script=document.createElement('script');script.src=new URL('app.js',assetBase).href;script.onerror=()=>fail(new Error('Viewer controls could not load.'));document.head.append(script);
 }catch(e){fail(e);}
})();
