/* Catálogo informativo Ponky: logo, imágenes y menú. Sin formularios de pedido. */
$(function () {
  'use strict';
  if(window.__ponkyLista)return;
  window.__ponkyLista=true;
  $('header').attr('data-hidratado','true');
  $('.hamburguesa').prop('disabled',false).attr('aria-busy','false');
  $('#estadoHidratacion').text('Interfaz interactiva lista.');
  $('img[data-imagen-ponky]').each(function(){
    const img=this;
    function fallo(){$(img).hide();$(img).siblings('.reemplazo-ponky').prop('hidden',false);}
    function bien(){$(img).show();$(img).siblings('.reemplazo-ponky').prop('hidden',true);}
    $(img).off('error.ponky load.ponky').on('error.ponky',fallo).on('load.ponky',bien);
    if(img.complete){if(img.naturalWidth)bien();else fallo();}
  });
  const datos=window.CATALOGO_PERSONALIZADO;
  const kit=datos&&datos.productos.find(item=>item.id===6);
  if(kit&&Number.isFinite(kit.precio))$('.precio-kit').text('Bs '+kit.precio.toFixed(2));
  // Fotos ampliadas y consultas: sin pedidos ni formularios.
  const productos=datos?datos.productos:[];
  const WHATSAPP='https://wa.me/qr/QQE35HF7TADBK1';
  const visor=$('<dialog>').attr({id:'visorFotosPonky','aria-labelledby':'tituloVisorPonky'}).addClass('visor-fotos-ponky');
  visor.append(`<div class="visor-cabecera"><h2 id="tituloVisorPonky"></h2><button id="cerrarVisorPonky" type="button" aria-label="Cerrar foto ampliada">✕</button></div><div class="visor-lienzo"><img id="fotoAmpliadaPonky" alt=""><p id="errorFotoPonky" role="status" hidden>Esta foto todavía no está disponible.</p></div><div class="visor-controles"><button id="anteriorFotoPonky" type="button" aria-label="Ver foto anterior">←</button><span id="contadorFotoPonky" aria-live="polite"></span><button id="siguienteFotoPonky" type="button" aria-label="Ver foto siguiente">→</button></div>`);
  $('body').append(visor);
  const consulta=$('<dialog>').attr({id:'consultaProductoPonky','aria-labelledby':'tituloConsultaPonky'}).addClass('consulta-producto-ponky');
  consulta.append(`<button id="cerrarConsultaPonky" type="button" aria-label="Cerrar consulta">✕</button><span class="etiqueta">HABLEMOS POR WHATSAPP</span><h2 id="tituloConsultaPonky"></h2><p>Copia este mensaje y pégalo en el WhatsApp de Ponky.</p><p id="mensajeConsultaPonky" class="mensaje-consulta-ponky" tabindex="0"></p><div class="acciones-consulta"><button id="copiarConsultaPonky" type="button">Copiar consulta</button><a id="abrirWhatsAppPonky" href="https://wa.me/qr/QQE35HF7TADBK1" target="_blank" rel="noopener noreferrer">Abrir WhatsApp ↗</a></div><p id="estadoConsultaPonky" role="status"></p>`);
  $('body').append(consulta);
  $('#abrirWhatsAppPonky').attr('href',WHATSAPP);
  let indiceFoto=0,origenFoto,origenConsulta,versionCopia=0;
  function productoPorId(id){return productos.find(p=>p.id===Number(id));}
  function mostrarFoto(indice){
    indiceFoto=(indice+productos.length)%productos.length;
    const producto=productos[indiceFoto];
    $('#tituloVisorPonky').text(producto.nombre);$('#contadorFotoPonky').text((indiceFoto+1)+' / '+productos.length);
    $('#errorFotoPonky').prop('hidden',true);
    const imagen=$('#fotoAmpliadaPonky');imagen.prop('hidden',false).attr({alt:'Foto ampliada de '+producto.nombre,src:producto.imagen});
  }
  function abrirFoto(id){const indice=productos.findIndex(p=>p.id===Number(id));if(indice<0)return;origenFoto=document.activeElement;mostrarFoto(indice);if(!visor[0].open)visor[0].showModal();}
  function abrirConsulta(id){const producto=productoPorId(id);if(!producto)return;origenConsulta=document.activeElement;versionCopia++;$('#tituloConsultaPonky').text('Consulta sobre '+producto.nombre);const precio=Number.isFinite(producto.precio)?' (precio publicado: Bs '+producto.precio.toFixed(2)+')':'';$('#mensajeConsultaPonky').text('Hola, Ponky. Quisiera consultar '+(precio?'la disponibilidad de ':'el precio y la disponibilidad de ')+producto.nombre+precio+'.');$('#estadoConsultaPonky').text('');$('#copiarConsultaPonky').prop('disabled',false).text('Copiar consulta');if(!consulta[0].open)consulta[0].showModal();}
  function enriquecerCatalogo(){
    $('#productos .producto').each(function(){
      const tarjeta=$(this),id=Number(tarjeta.attr('data-id')),producto=productoPorId(id);if(!producto)return;
      const imagen=tarjeta.find('.imagen-producto');
      if(!imagen.find('.ampliar-foto-ponky').length){
        const contenido=imagen.children('img,.placeholder');
        contenido.wrapAll($('<button>').addClass('ampliar-foto-ponky').attr({type:'button','data-ampliar-foto':id,'aria-label':'Ampliar foto de '+producto.nombre}));
        imagen.find('.ampliar-foto-ponky').append($('<span>').addClass('pista-ampliar').attr('aria-hidden','true').text('Ampliar foto ↗'));
      }
      if(!tarjeta.find('.consultar-producto-ponky').length){
        tarjeta.find('.producto-pie').append($('<button>').attr({type:'button','data-consultar-producto':id,'aria-label':'Consultar por WhatsApp sobre '+producto.nombre}).addClass('consultar-producto-ponky').text('Consultar por WhatsApp ↗'));
      }
    });
  }
  // Los botones nuevos funcionan después de filtrar sin listeners por tarjeta.
  $('#productos').off('click.fotosPonky','[data-ampliar-foto]').on('click.fotosPonky','[data-ampliar-foto]',function(){abrirFoto($(this).attr('data-ampliar-foto'));});
  $(document).off('click.consultaPonky','[data-consultar-producto]').on('click.consultaPonky','[data-consultar-producto]',function(){abrirConsulta($(this).attr('data-consultar-producto'));});
  // El carrusel y la foto destacada del kit también pueden ampliarse.
  $('.carrusel-productos-ponky .slide,.foto-kit').each(function(){
    const bloque=$(this),img=bloque.children('img')[0];if(!img)return;
    const producto=productos.find(p=>p.imagen===img.getAttribute('src'));if(!producto)return;
    bloque.children('img,.placeholder,.reemplazo-ponky').wrapAll($('<button>').addClass('ampliar-foto-ponky').attr({type:'button','data-ampliar-destacada':producto.id,'aria-label':'Ampliar foto de '+producto.nombre}));
  });
  $(document).off('click.fotoDestacadaPonky','[data-ampliar-destacada]').on('click.fotoDestacadaPonky','[data-ampliar-destacada]',function(){abrirFoto($(this).attr('data-ampliar-destacada'));});
  $(window).off('catalogo-renderizado.fotosPonky').on('catalogo-renderizado.fotosPonky',enriquecerCatalogo);
  $(window).off('producto-detalle.consultaPonky').on('producto-detalle.consultaPonky',function(e){const p=e.originalEvent.detail.producto;let acciones=$('#accionesDetallePonky');if(!acciones.length){acciones=$('<div>').attr('id','accionesDetallePonky').addClass('acciones-detalle-ponky');$('#detalle').append(acciones);}acciones.empty().append($('<button>').attr({type:'button','data-ampliar-detalle':p.id}).text('Ampliar foto ↗'),$('<button>').attr({type:'button','data-consultar-producto':p.id}).text('Consultar por WhatsApp ↗'));});
  $('#detalle').off('click.fotoDetallePonky','[data-ampliar-detalle]').on('click.fotoDetallePonky','[data-ampliar-detalle]',function(){abrirFoto($(this).attr('data-ampliar-detalle'));});
  $('#fotoAmpliadaPonky').off('error.fotosPonky load.fotosPonky').on('error.fotosPonky',function(){$(this).prop('hidden',true);$('#errorFotoPonky').prop('hidden',false);}).on('load.fotosPonky',function(){$(this).prop('hidden',false);$('#errorFotoPonky').prop('hidden',true);});
  $('#cerrarVisorPonky').off('click.fotosPonky').on('click.fotosPonky',()=>visor[0].close());
  $('#anteriorFotoPonky').off('click.fotosPonky').on('click.fotosPonky',()=>mostrarFoto(indiceFoto-1));
  $('#siguienteFotoPonky').off('click.fotosPonky').on('click.fotosPonky',()=>mostrarFoto(indiceFoto+1));
  visor.off('keydown.fotosPonky close.fotosPonky').on('keydown.fotosPonky',function(e){if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();mostrarFoto(indiceFoto+(e.key==='ArrowLeft'?-1:1));}}).on('close.fotosPonky',function(){if(origenFoto&&document.contains(origenFoto))origenFoto.focus();});
  $('#cerrarConsultaPonky').off('click.consultaPonky').on('click.consultaPonky',()=>consulta[0].close());
  consulta.off('close.consultaPonky').on('close.consultaPonky',function(){versionCopia++;if(origenConsulta&&document.contains(origenConsulta))origenConsulta.focus();});
  $('#copiarConsultaPonky').off('click.consultaPonky').on('click.consultaPonky',async function(){
    const version=versionCopia,texto=$('#mensajeConsultaPonky').text();
    $(this).prop('disabled',true);
    try{if(!navigator.clipboard||!navigator.clipboard.writeText)throw new Error('Sin acceso al portapapeles');await navigator.clipboard.writeText(texto);if(version===versionCopia)$('#estadoConsultaPonky').text('Consulta copiada. Abre WhatsApp y pégala en el chat de Ponky.');}
    catch{if(version===versionCopia){const rango=document.createRange();rango.selectNodeContents(document.getElementById('mensajeConsultaPonky'));const seleccion=window.getSelection();seleccion.removeAllRanges();seleccion.addRange(rango);$('#estadoConsultaPonky').text('No se pudo copiar automáticamente. Copia el mensaje seleccionado y pégalo en WhatsApp.');}}
    finally{if(version===versionCopia)$(this).prop('disabled',false);}
  });
  // Escape cierra los diálogos de forma nativa; clic en el fondo también cierra.
  visor.add(consulta).off('click.fondoPonky').on('click.fondoPonky',function(e){if(e.target!==this)return;const r=this.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)this.close();});
  $(window).off('pagehide.fotosPonky').on('pagehide.fotosPonky',function(){if(visor[0].open)visor[0].close();if(consulta[0].open)consulta[0].close();});
  enriquecerCatalogo();
});
