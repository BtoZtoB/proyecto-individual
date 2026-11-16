/* C3-A1: caché limitada a esta carpeta de fase; no toca las otras fases. */
'use strict';
importScripts('./sync-config.js','./cola-offline.js');
const BASE=new URL('./',self.location.href);
const CACHE_PREFIX='ponky-c3a1-'+encodeURIComponent(BASE.pathname)+'-';
const CACHE_NAME = CACHE_PREFIX + 'e79a0526c7c1';
const ASSETS = [
  "./",
  "./c3-ui.css",
  "./catalogo.js",
  "./cola-offline.js",
  "./componentes.css",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./index.html",
  "./manifest.json",
  "./offline.html",
  "./ponky-datos.js",
  "./ponky.css",
  "./ponky.js",
  "./pwa.css",
  "./pwa.js",
  "./responsividad.css",
  "./style.css",
  "./sync-config.js",
  "./vendor/jquery-3.7.1.min.js",
  "./pantallas.css",
  "./pantallas.js"
];
const OPTIONAL_ASSETS=["./img/logo-ponky.png", "./img/empanadas.jpg", "./img/rollo-de-queso.jpg", "./img/queque.jpg", "./img/mini-rollo-de-queso.jpg", "./img/pucas.jpg", "./img/kit-de-graduacion.jpg"];
const STATIC_PATHS=new Set([...ASSETS,...OPTIONAL_ASSETS].map(path=>new URL(path,BASE).pathname));
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE_NAME);
 await cache.addAll(ASSETS.map(path=>new Request(new URL(path,BASE),{cache:'reload'})));
 await Promise.all(OPTIONAL_ASSETS.map(async path=>{const url=new URL(path,BASE);try{const response=await fetch(new Request(url,{cache:'reload'}));if(response.ok)await cache.put(new Request(url),response);}catch{/* Las fotos se incorporan manualmente. */}}));
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(key=>key.startsWith(CACHE_PREFIX)&&key!==CACHE_NAME).map(key=>caches.delete(key)));await self.clients.claim();})()));
self.addEventListener('message',event=>{if(event.data&&event.data.type==='SKIP_WAITING')self.skipWaiting();});
self.addEventListener('sync',event=>{if(event.tag==='sincronizar-portafolio')event.waitUntil((async()=>{const result=await self.ColaOffline.sincronizar();const clients=await self.clients.matchAll({type:'window'});clients.forEach(client=>client.postMessage({type:'SYNC_STATUS',...result}));if(result.configured&&result.pending)throw new Error('Pendientes de confirmar.');})());});
self.addEventListener('fetch',event=>{
 const req=event.request,url=new URL(req.url);
 if(req.method!=='GET'||url.origin!==BASE.origin||!url.pathname.startsWith(BASE.pathname))return;
 if(!STATIC_PATHS.has(url.pathname)&&req.mode!=='navigate')return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE_NAME);const canonical=url.pathname.endsWith('/')?new URL('index.html',url):url;
  const cached=await cache.match(canonical.href,{ignoreSearch:true});if(cached)return cached;
  try{const response=await fetch(req);if(response.ok&&STATIC_PATHS.has(url.pathname))await cache.put(new Request(url.origin+url.pathname),response.clone());return response;}
  catch{if(req.mode==='navigate'){const fallback=await cache.match(new URL('offline.html',BASE).href);if(fallback)return fallback;}return new Response('Recurso no disponible offline.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});}
 })());
});
