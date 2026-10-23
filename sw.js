const C='tegn-v10',AC='tegn-audio-v1';
const FILES=['./','index.html','words.json','audio.json','manifest.json','fonts/Nunito.ttf','favicon.svg','favicon-32.png','icon-180.png','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(FILES)))});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C&&x!==AC).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
async function audio(req){const url=req.url.split('?')[0],c=await caches.open(AC);let r=await c.match(url);
 if(!r){r=await fetch(url);if(r.ok)c.put(url,r.clone());else return r}
 const range=req.headers.get('range');if(!range)return r;
 const buf=await r.arrayBuffer(),m=/bytes=(\d*)-(\d*)/.exec(range)||[];const s=+(m[1]||0),e=m[2]?+m[2]:buf.byteLength-1;
 return new Response(buf.slice(s,e+1),{status:206,headers:{'Content-Type':'audio/mpeg','Content-Range':`bytes ${s}-${e}/${buf.byteLength}`,'Content-Length':String(e-s+1),'Accept-Ranges':'bytes'}})}
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(u.origin!==location.origin)return;
 if(u.pathname.includes('/audio/')&&u.pathname.endsWith('.mp3'))return e.respondWith(audio(e.request).catch(()=>fetch(e.request)));
 e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(C).then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request)))});
