/* Biblioteca compartida por páginas y Service Worker: cola IndexedDB durable.
   Reintentos idempotentes: el servidor debe deduplicar por operation.id. */
(function (scope) {
  'use strict';
  const base = new URL('../', typeof document !== 'undefined' ? document.currentScript.src : new URL('assets/cola-offline.js', scope.location.href));
  const dbName = 'portafolio-cola-' + encodeURIComponent(base.pathname);
  const store = 'operaciones';
  let apertura;
  function db() {
    if (!scope.indexedDB) return Promise.reject(new Error('IndexedDB no disponible.'));
    if (!apertura) apertura = new Promise((resolve, reject) => {
      const request = scope.indexedDB.open(dbName, 1);
      request.onupgradeneeded = () => request.result.createObjectStore(store, {keyPath:'id'});
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => { apertura = null; reject(request.error); };
      request.onblocked = () => { apertura = null; reject(new Error('Almacenamiento ocupado.')); };
    });
    return apertura;
  }
  async function transact(mode, action) {
    const connection = await db();
    return new Promise((resolve, reject) => {
      const tx = connection.transaction(store, mode);
      let request;
      try { request = action(tx.objectStore(store)); } catch (error) { reject(error); return; }
      tx.oncomplete = () => resolve(request ? request.result : undefined);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error || new Error('Transacción cancelada.'));
    });
  }
  async function listar() {
    const items = await transact('readonly', s => s.getAll());
    return items.sort((a,b) => a.createdAt - b.createdAt || a.id.localeCompare(b.id));
  }
  async function agregar(contexto, clave, datos) {
    const operation = {id: scope.crypto && scope.crypto.randomUUID ? scope.crypto.randomUUID() : Date.now().toString(36)+'-'+Math.random().toString(36).slice(2), context: contexto, key: clave, data: datos, createdAt: Date.now(), type:'replace-local-collection'};
    // Un snapshot pendiente por colección evita crecimiento ilimitado de la cola.
    await transact('readwrite', s => {
      const req = s.indexNames.contains('key') ? s.index('key').openCursor(clave) : s.openCursor();
      req.onsuccess = () => { const cursor=req.result; if (!cursor) { s.put(operation); return; } if (cursor.value.key===clave && cursor.value.context===contexto) cursor.delete(); cursor.continue(); };
    });
    return operation;
  }
  async function cantidad() { return transact('readonly', s => s.count()); }
  let envio;
  async function sincronizar() {
    if (envio) return envio;
    envio = (async () => {
      const operations = await listar();
      const endpoint = scope.PORTAFOLIO_SYNC && scope.PORTAFOLIO_SYNC.endpoint;
      if (!endpoint || !operations.length) return {sent:0,pending:operations.length,configured:Boolean(endpoint)};
      const target = new URL(endpoint, base);
      if (target.origin !== base.origin || (target.protocol !== 'https:' && !['localhost','127.0.0.1'].includes(target.hostname))) throw new Error('El endpoint debe ser seguro y del mismo origen.');
      const response = await scope.fetch(target.href,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({operations}),credentials:'same-origin',cache:'no-store'});
      if (!response.ok) throw new Error('El servidor no confirmó el envío.');
      const result = await response.json();
      if (!result || !Array.isArray(result.acknowledged)) throw new Error('Falta la confirmación del servidor.');
      const sentIds = new Set(operations.map(item=>item.id));
      const acknowledged = result.acknowledged.filter(id=>typeof id==='string' && sentIds.has(id));
      await transact('readwrite', s => { acknowledged.forEach(id=>s.delete(id)); });
      return {sent:acknowledged.length,pending:await cantidad(),configured:true};
    })();
    try { return await envio; } finally { envio=null; }
  }
  scope.ColaOffline = Object.freeze({agregar,listar,cantidad,sincronizar});
})(typeof self !== 'undefined' ? self : globalThis);
