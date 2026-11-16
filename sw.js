/* Offline-first: precarga completa, caché por versión y ruta de subcarpeta. */
'use strict';
importScripts('./sync-config.js','./assets/cola-offline.js');
const BASE = new URL('./',self.location.href);
const CACHE_PREFIX = 'portafolio-' + encodeURIComponent(BASE.pathname) + '-';
const CACHE_NAME = CACHE_PREFIX + '2b9e3b4a7095';
const ASSETS = [
  "./",
  "./assets/catalogos-extra.css",
  "./assets/catalogos.js",
  "./assets/cola-offline.js",
  "./assets/diagnostico.css",
  "./assets/diagnostico.js",
  "./assets/img/banner1.svg",
  "./assets/img/banner2.svg",
  "./assets/img/banner3.svg",
  "./assets/img/catalogo1.svg",
  "./assets/img/catalogo2.svg",
  "./assets/img/catalogo3.svg",
  "./assets/img/catalogo4.svg",
  "./assets/img/producto1.svg",
  "./assets/img/producto2.svg",
  "./assets/img/producto3.svg",
  "./assets/img/producto4.svg",
  "./assets/img/producto5.svg",
  "./assets/img/producto6.svg",
  "./assets/modulos.js",
  "./assets/pwa.css",
  "./assets/responsividad.css",
  "./assets/ui-avanzada.css",
  "./assets/ui-avanzada.js",
  "./assets/vendor/jquery-3.7.1.min.js",
  "./auditoria.html",
  "./catalogo1/index.html",
  "./catalogo1/ponky-datos.js",
  "./catalogo1/ponky.css",
  "./catalogo1/ponky.js",
  "./catalogo1/style.css",
  "./catalogo2/index.html",
  "./catalogo2/style.css",
  "./catalogo3/index.html",
  "./catalogo3/style.css",
  "./catalogo4/index.html",
  "./catalogo4/style.css",
  "./diagnostico.html",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./img/perfil.jpg",
  "./index.html",
  "./manifest.json",
  "./offline.html",
  "./pwa.js",
  "./script.js",
  "./style.css",
  "./sync-config.js",
  "./catalogo1/pantallas.css",
  "./catalogo1/pantallas.js"
];
const OPTIONAL_ASSETS = ["./catalogo1/img/logo-ponky.png", "./catalogo1/img/empanadas.jpg", "./catalogo1/img/rollo-de-queso.jpg", "./catalogo1/img/queque.jpg", "./catalogo1/img/mini-rollo-de-queso.jpg", "./catalogo1/img/pucas.jpg", "./catalogo1/img/kit-de-graduacion.jpg"];
const STATIC_PATHS = new Set([...ASSETS,...OPTIONAL_ASSETS].map(path=>new URL(path,BASE).pathname));
self.addEventListener('install', event=>{
  // No se declara lista para offline si falta un solo recurso obligatorio.
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE_NAME);
    await cache.addAll(ASSETS.map(path=>new Request(new URL(path,BASE),{cache:'reload'})));
    // Las fotografías se incorporarán manualmente; su ausencia no bloquea la PWA.
    await Promise.all(OPTIONAL_ASSETS.map(async path=>{
      const url=new URL(path,BASE);
      try{const response=await fetch(new Request(url,{cache:'reload'}));if(response.ok)await cache.put(new Request(url),response);}catch{/* Imagen todavía no agregada. */}
    }));
  })());
});
self.addEventListener('activate', event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key.startsWith(CACHE_PREFIX)&&key!==CACHE_NAME).map(key=>caches.delete(key)));
    await self.clients.claim();
    if (self.PORTAFOLIO_SYNC && self.PORTAFOLIO_SYNC.endpoint) {
      try {await self.ColaOffline.sincronizar();} catch {/* La cola conserva los cambios hasta el próximo intento. */}
    }
  })());
});
self.addEventListener('message',event=>{
  if(event.data && event.data.type==='SKIP_WAITING')self.skipWaiting();
});
self.addEventListener('sync',event=>{
  if(event.tag==='sincronizar-portafolio')event.waitUntil((async()=>{
    const result=await self.ColaOffline.sincronizar();
    const clientes=await self.clients.matchAll({type:'window'});
    clientes.forEach(client=>client.postMessage({type:'SYNC_STATUS',...result}));
    if(result.configured && result.pending)throw new Error('Todavía hay operaciones pendientes.');
  })());
});
self.addEventListener('fetch',event=>{
  const request=event.request,url=new URL(request.url);
  if(request.method!=='GET'||url.origin!==BASE.origin||!url.pathname.startsWith(BASE.pathname))return;
  // Los endpoints de sincronización y otros servicios no se sirven desde caché.
  if(!STATIC_PATHS.has(url.pathname)&&request.mode!=='navigate')return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE_NAME);
    let canonical=url;
    if(url.pathname.endsWith('/'))canonical=new URL('index.html',url);
    const cached=await cache.match(canonical.href,{ignoreSearch:true});
    if(cached)return cached;
    try{
      const response=await fetch(request);
      if(response.ok && STATIC_PATHS.has(url.pathname))await cache.put(new Request(url.origin+url.pathname),response.clone());
      return response;
    }catch(error){
      if(request.mode==='navigate'){
        const fallback=await cache.match(new URL('offline.html',BASE).href);
        if(fallback)return fallback;
      }
      return new Response('Recurso no disponible sin conexión.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
    }
  })());
});
