const CACHE='jk-bms-config-v0.1.2';
const FILES=['./','./index.html','./styles.css','./js/app.js','./js/model.js','./js/settings.js','./js/i18n.js','./js/reference.js','./manifest.webmanifest','./assets/logo.svg','./assets/icon-192.png','./assets/icon-512.png'];
self.addEventListener('message',event=>{if(event.data?.type==='ACTIVATE_UPDATE')self.skipWaiting()});
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)).then(async()=>{
 // Older releases have no update button; migrate their worker after a full cache.
 const keys=await caches.keys();
 if(keys.some(key=>['jk-bms-config-v0.1.0','jk-bms-config-v0.1.1'].includes(key)))await self.skipWaiting();
})));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('jk-bms-config-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=='GET'||url.origin!==self.location.origin)return;
 // Cache only the declared app files, never arbitrary paths or private documents.
 const known=FILES.some(path=>new URL(path,self.registration.scope).pathname===url.pathname);
 if(!known)return;
 event.respondWith(caches.match(event.request,{ignoreSearch:true}).then(hit=>hit||fetch(event.request)));
});
