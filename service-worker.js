const CACHE='balance-kontrolle-v4';
const FILES=['./','./index.html','./styles.css?v=4','./app.js?v=4','./training.json?v=4','./manifest.webmanifest','./training-loop.mp3','./einbeinstand.jpg','./blickwechsel_links.jpg','./antippen_a.jpg','./antippen_b.jpg','./beuge_a.jpg','./beuge_b.jpg'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)))});
self.addEventListener('activate',e=>e.waitUntil(Promise.all([self.clients.claim(),caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))])));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match(e.request)))});
