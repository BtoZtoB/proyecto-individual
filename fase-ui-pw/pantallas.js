$(function(){
  'use strict';
  if(window.__pantallasPonky)return;window.__pantallasPonky=true;
  const rutas=['inicio','catalogo','kitPonky','nosotros'];
  const rejilla=document.getElementById('productos');
  let activa='inicio',pagina=0,capacidad=2,firma='',pendiente=0,ultimoAlto=0,altoSinTeclado=window.innerHeight;
  const tabs=$('#pestanasPonky [role=tab]');
  const footerInicio=$('#footerPantallasPonky');
  // Reutiliza los controles existentes dentro de una ventana compacta.
  $('#herramientasFiltrosPonky').append($('#catalogo .herramientas-extra'));
  function cambiar(id,ponerFoco=false){
    if(id==='contacto')id='inicio';
    if(!rutas.includes(id))return;
    activa=id;
    const conFooter=id==='inicio'||id==='nosotros';
    footerInicio.prop('hidden',!conFooter);
    $('.credito-pantalla').prop('hidden',conFooter);
    document.body.classList.toggle('con-footer-ponky',conFooter);
    rutas.forEach(ruta=>{const selected=ruta===id;$('#'+ruta).prop('hidden',!selected);$('#tab-'+ruta).attr({'aria-selected':String(selected),tabindex:selected?'0':'-1'});});
    if(location.hash!=='#'+id)history.replaceState(null,'','#'+id);
    if(ponerFoco)$('#tab-'+id).trigger('focus');
    ajustar();
    document.dispatchEvent(new Event('visibilitychange'));
  }
  function ajustar(){cancelAnimationFrame(pendiente);pendiente=requestAnimationFrame(pintarPagina);}
  function pintarPagina(){
    pendiente=0;
    const tarjetas=[...rejilla.children].filter(e=>e.classList.contains('producto'));
    const nuevaFirma=tarjetas.map(e=>e.dataset.id).join(',');
    if(nuevaFirma!==firma){pagina=0;firma=nuevaFirma;}
    tarjetas.forEach(t=>{
      const detalles=t.querySelector('[data-detalle]');if(detalles)detalles.textContent='Detalles ↗';
      const consulta=t.querySelector('.consultar-producto-ponky');if(consulta)consulta.textContent='WhatsApp ↗';
    });
    if(activa!=='catalogo')return;
    const ancho=rejilla.clientWidth||window.innerWidth-24;
    const alto=rejilla.clientHeight||Math.max(100,window.innerHeight-270);
    const compacta=alto<180;
    const columnas=alto<115?1:(ancho>=900?3:ancho>=620?3:ancho<310?1:2);
    const filas=compacta?1:Math.max(1,Math.min(3,Math.floor((alto+10)/210)));
    const nuevaCapacidad=Math.max(1,columnas*filas);
    if(nuevaCapacidad!==capacidad){pagina=Math.floor((pagina*capacidad)/nuevaCapacidad);capacidad=nuevaCapacidad;}
    const paginas=Math.max(1,Math.ceil(tarjetas.length/capacidad));pagina=Math.max(0,Math.min(pagina,paginas-1));
    rejilla.style.setProperty('--columnas-ponky',columnas);
    rejilla.style.setProperty('--filas-ponky',Math.min(filas,Math.max(1,Math.ceil(tarjetas.length/columnas))));
    rejilla.classList.toggle('compacta',compacta);rejilla.classList.toggle('minima',alto<100);
    tarjetas.forEach((t,i)=>{t.hidden=i<pagina*capacidad||i>=(pagina+1)*capacidad;});
    $('#paginaAnteriorPonky').prop('disabled',pagina===0);
    $('#paginaSiguientePonky').prop('disabled',pagina===paginas-1);
    $('#estadoPaginaPonky').text(tarjetas.length?'Página '+(pagina+1)+' de '+paginas+' · '+tarjetas.length+' productos':'Sin resultados');
  }
  $('#pestanasPonky').off('click.pantallas','[role=tab]').on('click.pantallas','[role=tab]',function(){cambiar($(this).attr('aria-controls'));});
  $('#pestanasPonky').off('keydown.pantallas','[role=tab]').on('keydown.pantallas','[role=tab]',function(e){const index=tabs.index(this);let next;if(e.key==='ArrowRight')next=(index+1)%tabs.length;else if(e.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=tabs.length-1;else return;e.preventDefault();cambiar(tabs.eq(next).attr('aria-controls'),true);});
  $(document).off('click.rutasPonky','a[href^="#"]').on('click.rutasPonky','a[href^="#"]',function(e){const id=this.getAttribute('href').slice(1);if(rutas.includes(id)){e.preventDefault();cambiar(id);}});
  $(window).off('hashchange.pantallas').on('hashchange.pantallas',()=>cambiar(location.hash.slice(1)));
  $('#paginaAnteriorPonky').off('click.pantallas').on('click.pantallas',()=>{pagina--;pintarPagina();});
  $('#paginaSiguientePonky').off('click.pantallas').on('click.pantallas',()=>{pagina++;pintarPagina();});
  function abrir(id){const d=document.getElementById(id);if(!d.open)d.showModal();}
  $('#abrirFiltrosPonky').off('click.pantallas').on('click.pantallas',()=>abrir('filtrosPonky'));
  $('#abrirCarruselPonky').off('click.pantallas').on('click.pantallas',()=>cambiar('nosotros'));
  $(document).off('click.cerrarVentanaPonky','[data-cerrar-dialogo]').on('click.cerrarVentanaPonky','[data-cerrar-dialogo]',function(){document.getElementById($(this).attr('data-cerrar-dialogo')).close();});
  $(window).off('catalogo-renderizado.pantallas').on('catalogo-renderizado.pantallas',()=>{pagina=0;ajustar();});
  function altoViewport(){
    const vv=window.visualViewport,alto=Math.round(vv?vv.height:window.innerHeight);
    if(alto!==ultimoAlto){document.documentElement.style.setProperty('--alto-ponky',alto+'px');ultimoAlto=alto;}
    const escribiendo=document.activeElement&&document.activeElement.matches('input[type=search],input[type=text],textarea');
    if(!escribiendo)altoSinTeclado=alto;
    document.body.classList.toggle('teclado-activo',Boolean(escribiendo&&alto<altoSinTeclado*.8));
    ajustar();
  }
  $(window).off('resize.pantallas orientationchange.pantallas').on('resize.pantallas orientationchange.pantallas',altoViewport);
  $(document).off('focusin.viewportPonky focusout.viewportPonky').on('focusin.viewportPonky focusout.viewportPonky',altoViewport);
  if(window.visualViewport)window.visualViewport.addEventListener('resize',altoViewport);
  if(window.ResizeObserver){const observer=new ResizeObserver(ajustar);observer.observe(rejilla);}
  $(window).off('pagehide.pantallas pageshow.pantallas').on('pagehide.pantallas',()=>cancelAnimationFrame(pendiente)).on('pageshow.pantallas',altoViewport);
  altoViewport();cambiar(rutas.includes(location.hash.slice(1))?location.hash.slice(1):'inicio');
});
