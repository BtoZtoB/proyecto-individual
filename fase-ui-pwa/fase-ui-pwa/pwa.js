(function () {
  'use strict';
  const base = new URL('./',document.currentScript.src);
  const ocultarHerramientas = document.body.getAttribute('data-marca') === 'ponky';
  let registro, peticionInstalar, listoOffline=false;
  const ui = document.createElement('section');
  ui.className='pwa-herramientas';ui.setAttribute('aria-label','Estado de la aplicación');
  const red=document.createElement('span');red.id='estadoRed';red.setAttribute('role','status');
  const cache=document.createElement('span');cache.id='estadoOffline';cache.setAttribute('role','status');
  const datos=document.createElement('span');datos.id='estadoSincronizacion';datos.setAttribute('role','status');
  const instalar=document.createElement('button');instalar.id='instalarApp';instalar.type='button';instalar.textContent='Instalar app';instalar.hidden=true;
  const actualizar=document.createElement('button');actualizar.id='actualizarApp';actualizar.type='button';actualizar.textContent='Actualizar app';actualizar.hidden=true;
  const ayuda=document.createElement('details');const resumen=document.createElement('summary');resumen.textContent='Cómo instalar';const instruccion=document.createElement('p');instruccion.textContent='En Chrome o Brave, abre el menú del navegador y busca Instalar aplicación o Añadir a pantalla de inicio. En Safari usa Compartir → Añadir a pantalla de inicio. La opción depende de tu navegador.';ayuda.append(resumen,instruccion);
  ui.append(red,cache,datos,instalar,actualizar,ayuda);
  // Ponky conserva la PWA sin insertar controles técnicos en el catálogo.
  if (!ocultarHerramientas) {
    const header=document.querySelector('header'); if(header)header.after(ui);else document.body.prepend(ui);
  }
  function estadoRed() {red.textContent=navigator.onLine?'En línea':'Modo offline · Datos locales';red.dataset.online=String(navigator.onLine);}
  async function estadoCola() {
    if(!window.ColaOffline){datos.textContent='Guardado local';return;}
    try {
      const cantidad=await ColaOffline.cantidad();
      const configurado=Boolean(window.PORTAFOLIO_SYNC && PORTAFOLIO_SYNC.endpoint);
      datos.textContent=configurado ? (cantidad ? 'Guardado localmente · '+cantidad+' pendientes de envío' : 'Sin envíos pendientes') : 'Datos en este dispositivo'+(cantidad?' · '+cantidad+' cambios locales':'');
      datos.title=configurado?'Solo se marca enviado después de recibir confirmación del servidor.':'No hay un servicio remoto configurado. Los registros se conservan en este dispositivo.';
    }catch{datos.textContent='Datos locales · Cola no disponible';}
  }
  function avisoCache(texto, listo) {cache.textContent=texto;listoOffline=listo;cache.dataset.ready=String(listo);}
  async function prepararSync() {
    await estadoCola();
    if(!window.ColaOffline || !navigator.onLine || !window.PORTAFOLIO_SYNC || !PORTAFOLIO_SYNC.endpoint) return;
    try{await ColaOffline.sincronizar();await estadoCola();}
    catch{datos.textContent='Guardado localmente · Pendiente de envío';}
  }
  // Los formularios ya confirmaron el guardado local antes de emitir este evento.
  window.addEventListener('datos-locales-cambiados', async event=>{
    if(!event.detail || !window.ColaOffline) return;
    try {
      const journal = 'pwa-pendiente-' + event.detail.clave;
      const snapshot = JSON.stringify(event.detail);
      localStorage.setItem(journal, snapshot);
      await ColaOffline.agregar(event.detail.contexto,event.detail.clave,event.detail.datos);
      if (localStorage.getItem(journal) === snapshot) localStorage.removeItem(journal);
      await estadoCola();
      if(registro && 'sync' in registro && window.PORTAFOLIO_SYNC && PORTAFOLIO_SYNC.endpoint) {
        try{await registro.sync.register('sincronizar-portafolio');}catch{/* Se reintenta al recuperar conexión o abrir la app. */}
      }
      await prepararSync();
    }catch{datos.textContent='Datos guardados localmente · No se pudo preparar el envío';}
  });
  window.addEventListener('online',()=>{estadoRed();prepararSync();});window.addEventListener('offline',estadoRed);
  window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();if(ocultarHerramientas)return;peticionInstalar=event;instalar.hidden=false;});
  instalar.addEventListener('click',async()=>{if(!peticionInstalar)return;await peticionInstalar.prompt();const choice=await peticionInstalar.userChoice;peticionInstalar=null;instalar.hidden=true;if(choice.outcome==='accepted')ayuda.hidden=true;});
  window.addEventListener('appinstalled',()=>{instalar.hidden=true;ayuda.hidden=true;});
  if(window.matchMedia('(display-mode: standalone)').matches || navigator.standalone) ayuda.hidden=true;
  actualizar.addEventListener('click',()=>{if(registro && registro.waiting){sessionStorage.setItem('pwa-recargar','1');registro.waiting.postMessage({type:'SKIP_WAITING'});}});
  async function iniciar() {
    estadoRed();
    // Recupera cambios si se cerró la pestaña durante el guardado en IndexedDB.
    if(window.ColaOffline) {
      const keys=[];
      try { for(let i=0;i<localStorage.length;i++) {const key=localStorage.key(i);if(key.startsWith('pwa-pendiente-'))keys.push(key);} } catch { datos.textContent='El navegador no permite guardar datos locales.'; }
      for(const key of keys) {
        try {const raw=localStorage.getItem(key),item=JSON.parse(raw);if(item && typeof item.clave==='string' && Array.isArray(item.datos)){await ColaOffline.agregar(item.contexto,item.clave,item.datos);if(localStorage.getItem(key)===raw)localStorage.removeItem(key);}} catch {/* Se conserva el cambio para reintentar después. */}
      }
    }
    await estadoCola();
    if(!('serviceWorker' in navigator) || !window.isSecureContext){avisoCache('Offline requiere HTTPS o localhost',false);return;}
    avisoCache('Preparando acceso sin conexión…',false);
    try {
      registro=await navigator.serviceWorker.register(new URL('sw.js',base),{scope:base.pathname,updateViaCache:'none'});
      const mostrarActualizacion=()=>{if(registro.waiting && navigator.serviceWorker.controller){if(ocultarHerramientas)registro.waiting.postMessage({type:'SKIP_WAITING'});else actualizar.hidden=false;}};
      mostrarActualizacion();
      registro.addEventListener('updatefound',()=>{const worker=registro.installing;if(worker)worker.addEventListener('statechange',()=>{if(worker.state==='installed')mostrarActualizacion();if(worker.state==='redundant'&&!listoOffline)avisoCache('No se completó la descarga offline. Recarga con conexión.',false);});});
      navigator.serviceWorker.addEventListener('controllerchange',()=>{if(sessionStorage.getItem('pwa-recargar')==='1'){sessionStorage.removeItem('pwa-recargar');location.reload();}});
      navigator.serviceWorker.addEventListener('message',event=>{if(event.data && event.data.type==='SYNC_STATUS')estadoCola();});
      await navigator.serviceWorker.ready;
      avisoCache('Lista para usar sin conexión',true);
      await prepararSync();
    }catch{avisoCache('No se pudo activar el modo offline. Recarga con conexión para reintentar.',false);}
  }
  if(document.readyState==='complete')iniciar();else window.addEventListener('load',iniciar,{once:true});
})();
