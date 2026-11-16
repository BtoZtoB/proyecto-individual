(function () {
  'use strict';
  const appBase=new URL('../',document.currentScript.src);
  const input=document.getElementById('codigoInput'),reporte=document.getElementById('detallesReporte');
  function item(lista,texto){const li=document.createElement('li');li.textContent=texto;lista.append(li);}
  document.getElementById('btnAnalizar').addEventListener('click',()=>{
    const original=input.value;
    const error=document.getElementById('errorAnalisis');error.textContent='';
    if(!original.trim()){error.textContent='Pega algún código para analizar.';input.focus();return;}
    let limpio=original;const hallazgos=[];
    const sospechosas=['ad-banner','promo-box','social-ads','analytics','tracker'];
    for(const nombre of sospechosas){
      const selector=new RegExp('\\.'+nombre+'(?![\\w-])','g');
      const clase=new RegExp('\\bclass\\s*=\\s*(["\'])([^"\']*)\\1','gi');
      let encontrada=selector.test(original);
      for(const match of original.matchAll(clase)) if(match[2].split(/\s+/).includes(nombre))encontrada=true;
      if(encontrada){
        const reemplazo='seccion-destacada-'+nombre.replace(/-/g,'_');
        hallazgos.push('Posible conflicto de clase: '+nombre+'. Algunos filtros podrían ocultarla; se sugiere '+reemplazo+'.');
        limpio=limpio.replace(selector,'.'+reemplazo).replace(clase,(todo,comilla,valor)=>'class='+comilla+valor.split(/(\s+)/).map(token=>token===nombre?reemplazo:token).join('')+comilla);
      }
    }
    const alto=/(?<![\w-])height\s*:\s*100vh\s*;/gi;
    if(alto.test(original)){hallazgos.push('Altura rígida height: 100vh: puede cortar contenido con el teclado móvil. Se sugiere min-height: 100dvh.');limpio=limpio.replace(alto,'min-height: 100dvh;');}
    if(/\.each\s*\([\s\S]{0,500}?\.on\s*\(\s*['"]click['"]|\.forEach\s*\([\s\S]{0,500}?addEventListener\s*\(/.test(original))hallazgos.push('Posibles eventos individuales en un bucle. Revisa si puedes delegarlos a un contenedor estable con .off("click.namespace", selector).on("click.namespace", selector, handler). No se reescribe automáticamente.');
    if(/\.html\s*\(|\binnerHTML\s*=/.test(original))hallazgos.push('Se detectó una escritura de HTML. Revisa su origen: usa .text() o textContent para entradas del usuario. No se puede decidir su seguridad con esta búsqueda.');
    reporte.replaceChildren();
    if(!hallazgos.length)item(reporte,'No se encontraron los patrones revisados. Esto no certifica que el código esté libre de errores.');
    hallazgos.forEach(texto=>item(reporte,texto));
    document.getElementById('dictamen').textContent=hallazgos.length?'Código aprovechable: revisa '+hallazgos.length+' observaciones antes de aplicar las sugerencias.':'Código aprovechable según esta revisión básica.';
    document.getElementById('codigoSugerido').value=limpio;
    document.getElementById('panelResultado').hidden=false;
  });
  async function revisar(){
    const estado=document.getElementById('estadoTecnico');estado.replaceChildren();
    item(estado,'Contexto seguro: '+(window.isSecureContext?'sí':'no; usa HTTPS o localhost.'));
    item(estado,'Conectividad informada por el navegador: '+(navigator.onLine?'en línea':'offline'));
    try {
      const reg='serviceWorker' in navigator?await navigator.serviceWorker.getRegistration(appBase.href):null;
      item(estado,'Service Worker activo: '+(reg && reg.active?'sí':'todavía no'));
      item(estado,'Página controlada: '+('serviceWorker' in navigator&&navigator.serviceWorker.controller?'sí':'todavía no; espera la descarga inicial'));
    }catch{item(estado,'Service Worker: no disponible.');}
    try{const keys=await caches.keys();const prefix='portafolio-'+encodeURIComponent(new URL('./',location.href).pathname)+'-';let cantidad=0;for(const key of keys.filter(k=>k.startsWith(prefix))){cantidad+=(await (await caches.open(key)).keys()).length;}item(estado,'Recursos en caché de esta app: '+cantidad);}catch{item(estado,'Cache Storage no disponible en este contexto.');}
    try{item(estado,'Cambios en cola IndexedDB: '+await ColaOffline.cantidad());}catch{item(estado,'IndexedDB no disponible. Los formularios mantienen su guardado local si el navegador lo permite.');}
    item(estado,'Sincronización remota: '+(window.PORTAFOLIO_SYNC&&PORTAFOLIO_SYNC.endpoint?'configurada; requiere confirmación del servidor.':'sin servidor configurado; los datos se conservan localmente.'));
    try{const manifest=await(await fetch('manifest.json',{cache:'no-store'})).json();item(estado,'Manifest: '+manifest.name+' · '+manifest.icons.length+' iconos declarados.');}catch{item(estado,'No se pudo leer manifest.json.');}
  }
  document.getElementById('revisarPwa').addEventListener('click',revisar);revisar();
})();
