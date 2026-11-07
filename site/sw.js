const CACHE='jk-bms-config-v0.1.0';
const FILES=['./','./index.html','./styles.css','./js/app.js','./js/model.js','./js/settings.js','./js/i18n.js','./manifest.webmanifest','./assets/logo.svg','./assets/icon-192.png','./assets/icon-512.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('jk-bms-config-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=='GET'||url.origin!==self.location.origin)return;
 // Cache only the declared app files, never arbitrary paths or private documents.
 const known=FILES.some(path=>new URL(path,self.registration.scope).pathname===url.pathname);
 if(!known)return;
 event.respondWith(caches.match(event.request,{ignoreSearch:true}).then(hit=>hit||fetch(event.request)));
});
