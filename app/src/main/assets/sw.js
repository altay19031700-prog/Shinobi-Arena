const CACHE='shinobi-arena-v5.34-streamed-20261105';
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['/','/manifest.webmanifest','/icon-192.png','/icon-512.png'])).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('shinobi-arena-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{const r=e.request,u=new URL(r.url);if(r.method!=='GET'||u.origin!==location.origin||u.pathname.startsWith('/api/')||u.pathname==='/ws'||u.pathname==='/health'||u.pathname==='/qr')return;
 e.respondWith(fetch(r).then(resp=>{if(resp.ok&&resp.type==='basic'){const copy=resp.clone();caches.open(CACHE).then(c=>c.put(r,copy)).catch(()=>{});}return resp;}).catch(()=>caches.match(r).then(cached=>cached||Response.error())));
});
