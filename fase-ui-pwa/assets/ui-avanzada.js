/* Componentes adicionales. La hidratación es una simulación sobre HTML estático,
   no un servidor SSR. Los eventos se enlazan una sola vez con namespaces. */
$(function () {
  'use strict';
  if (window.__uiAvanzadaLista) return;
  window.__uiAvanzadaLista=true;
  const contexto=$('body').attr('data-catalogo'),personal=contexto==='portafolio';
  const clave='bitacora-ui-'+contexto;
  let bitacora=[];
  try{const valor=JSON.parse(localStorage.getItem(clave)||'[]');if(Array.isArray(valor))bitacora=valor.filter(e=>e&&typeof e.texto==='string'&&e.texto.length<=400&&typeof e.fecha==='string').slice(-50);}catch{/* Lista inicial vacía si el JSON fue dañado. */}
  const extras=$('<section>').addClass('contenedor seccion extras-ui').attr('id','herramientas-ui');
  // Plantilla fija: las entradas del usuario se agregan solamente con .text().
  extras.append(`
    <div class="encabezado-extra"><span class="etiqueta">EXPLORA Y ORGANIZA</span><h2>Encuentra lo que buscas</h2></div>
    <div class="filtro-cascada bloque-practico">
      <h3>Selección en tres capas</h3>
      <div class="capas-ui"><div><label for="capa1">1. Área</label><select id="capa1"><option value="">Elige un área</option><option value="catalogo">Catálogo</option><option value="consulta">Consultas</option></select></div><div><label for="capa2">2. Selección</label><select id="capa2" disabled><option value="">Primero elige un área</option></select></div></div>
      <div class="resultado-capa"><h4>3. Resultado</h4><p id="resultadoFiltro" role="status">Selecciona un área y una opción.</p><button id="aplicarCapas" type="button" class="btn-accion" disabled>Aplicar selección</button></div>
    </div>
    <div class="acordeones bloque-practico"><h3>Preguntas frecuentes</h3>
      <h4><button type="button" class="abrir-acordeon" aria-expanded="false" aria-controls="acordeon-guardar">¿Dónde se guardan mis registros? <span aria-hidden="true">+</span></button></h4><div id="acordeon-guardar" class="panel-acordeon"><p>Los datos se guardan en este navegador. Puedes consultarlos sin conexión después de completar la descarga inicial de la PWA.</p></div>
      <h4><button type="button" class="abrir-acordeon" aria-expanded="false" aria-controls="acordeon-tarifa">¿Cómo funciona el calculador? <span aria-hidden="true">+</span></button></h4><div id="acordeon-tarifa" class="panel-acordeon"><p>Es un ejemplo académico: 40 Bs por hora más el complemento elegido. La garantía del 20% ya forma parte del total. El modal permite confirmar durante 30 segundos y no realiza cobros.</p></div>
      <h4><button type="button" class="abrir-acordeon" aria-expanded="false" aria-controls="acordeon-conexion">¿Qué puedo usar sin Internet? <span aria-hidden="true">+</span></button></h4><div id="acordeon-conexion" class="panel-acordeon"><p>El portafolio, los cuatro catálogos y tus funciones locales están disponibles cuando el indicador muestra que la app está lista para usar sin conexión. Las redes sociales externas necesitan Internet.</p></div>
    </div>
    <div class="bloque-practico bitacora-ui"><div class="cabecera-bitacora"><h3>Actividad reciente</h3><button id="limpiarBitacora" type="button" class="btn-tactil">Limpiar actividad</button></div><p>Se muestran acciones completadas en este dispositivo, no escrituras ni reservas pendientes de confirmar.</p><ol id="listaBitacora"></ol><p id="bitacoraVacia">Todavía no hay actividad.</p><p id="estadoBitacora" role="status"></p></div>
  `);
  $('#modulos-practicos').after(extras);
  function pintarBitacora(){const lista=$('#listaBitacora').empty();bitacora.slice().reverse().forEach(e=>{const li=$('<li>');li.append($('<time>').text(new Date(e.fecha).toLocaleString('es-BO')),$('<span>').text(e.texto));lista.append(li);});$('#bitacoraVacia').prop('hidden',bitacora.length>0);}
  function registrar(texto){bitacora.push({fecha:new Date().toISOString(),texto});bitacora=bitacora.slice(-50);try{localStorage.setItem(clave,JSON.stringify(bitacora));}catch{$('#estadoBitacora').text('La actividad solo estará disponible mientras esta página siga abierta.');}pintarBitacora();}
  $(window).off('datos-locales-cambiados.bitacora').on('datos-locales-cambiados.bitacora',function(e){const detalle=e.originalEvent.detail;if(!detalle||String(detalle.contexto)!==String(contexto))return;const key=detalle.clave;registrar(key.startsWith('pedido-ponky-')?'Solicitud del kit Ponky actualizada en este dispositivo.':key.startsWith('turnos-')?'Reservas actualizadas y guardadas localmente.':key.startsWith('intereses-')?'Lista de interés actualizada.':key.startsWith('favoritos-')?'Favoritos actualizados.':'Consulta guardada en este navegador.');});
  $('#limpiarBitacora').off('click.ui').on('click.ui',function(){bitacora=[];try{localStorage.removeItem(clave);}catch{/* La limpieza de esta vista sigue siendo posible. */}pintarBitacora();$('#estadoBitacora').text('Actividad limpiada. Tus reservas y consultas se conservan.');});
  const catalogos=[['elegante','Catálogo elegante'],['moderno','Catálogo moderno'],['creativo','Catálogo creativo'],['minimalista','Catálogo minimalista']];
  const categorias=window.CATALOGO_PERSONALIZADO ? Object.entries(window.CATALOGO_PERSONALIZADO.categorias) : [['1','Categoría 1'],['2','Categoría 2'],['3','Categoría 3']];
  const consultas=personal?catalogos:[['Consulta de productos','Consulta de productos'],['Atención personalizada','Atención personalizada'],['Presentación del catálogo','Presentación del catálogo']];
  function opciones(){return $('#capa1').val()==='catalogo'?(personal?catalogos:categorias):consultas;}
  $('#capa1').off('change.capas').on('change.capas',function(){const select=$('#capa2').empty();select.append($('<option>').val('').text(this.value?'Elige una opción':'Primero elige un área'));select.prop('disabled',!this.value);if(this.value)opciones().forEach(([value,text])=>select.append($('<option>').val(value).text(text)));$('#resultadoFiltro').text('Selecciona un área y una opción.');$('#aplicarCapas').prop('disabled',true);});
  $('#capa2').off('change.capas').on('change.capas',function(){const seleccion=opciones().find(item=>item[0]===this.value);$('#resultadoFiltro').text(seleccion?'Seleccionaste: '+seleccion[1]:'Selecciona una opción para continuar.');$('#aplicarCapas').prop('disabled',!seleccion);});
  $('#aplicarCapas').off('click.capas').on('click.capas',function(){const value=$('#capa2').val();if(!opciones().some(item=>item[0]===value))return;if($('#capa1').val()==='catalogo'){if(personal)$('.filtro[data-filtro="'+value+'"]').trigger('click');else{$('#buscar').val('');if($('#ver-favoritos').attr('aria-pressed')==='true')$('#ver-favoritos').trigger('click');$('.filtros button[data-categoria="'+value+'"]').trigger('click');}document.querySelector(personal?'#proyectos':'#catalogo').scrollIntoView({block:'start'});}else{const destino=personal?catalogos.find(x=>x[0]===value)[1]:value;$('#salaSelect').val(destino).trigger('change');document.getElementById('modulos-practicos').scrollIntoView({block:'start'});}registrar('Selección aplicada: '+$('#capa2 option:selected').text()+'.');});
  $('.acordeones').off('click.acordeon','.abrir-acordeon').on('click.acordeon','.abrir-acordeon',function(){const abierto=$(this).attr('aria-expanded')==='true';$(this).attr('aria-expanded',String(!abierto));$(this).find('span').text(abierto?'+':'−');$('#'+$(this).attr('aria-controls')).stop(true,true).slideToggle(200);});
  const modal=$('<dialog>').attr({'id':'confirmacionReserva','aria-labelledby':'tituloConfirmacion'}).addClass('modal-confirmacion');
  modal.append(`<button id="cerrarConfirmacion" type="button" aria-label="Cerrar confirmación">✕</button><span class="etiqueta">RESERVA DE DEMOSTRACIÓN</span><h2 id="tituloConfirmacion">Revisa tu reserva</h2><p>El registro se guardará en este navegador. No se procesará un pago.</p><dl id="detalleConfirmacion"></dl><p class="reloj-confirmacion">Tiempo para confirmar: <strong id="tiempoReserva" role="timer" aria-label="Segundos restantes">00:30</strong></p><div class="acciones-modal"><button id="cancelarConfirmacion" type="button" class="btn-tactil">Cancelar</button><button id="procesarReserva" type="button" class="btn-accion">Confirmar reserva</button></div>`);
  $('body').append(modal);
  const toast=$('<div>').attr({id:'toastReserva',role:'status'}).addClass('toast-reserva');$('body').append(toast);
  let intervalo,fin,confirmar,temporizadorToast,temporizadorHidratacion,cerrando=false,disparador;
  function limpiarReloj(){clearInterval(intervalo);intervalo=undefined;}
  function avisar(texto){clearTimeout(temporizadorToast);toast.stop(true,true).text(texto).slideDown(180);temporizadorToast=setTimeout(()=>toast.fadeOut(200),3000);}
  function cerrar(inmediato=false){limpiarReloj();confirmar=null;cerrando=true;const finalizar=()=>{if(modal[0].open)modal[0].close();modal[0].style.removeProperty('display');cerrando=false;if(disparador&&document.contains(disparador))disparador.focus();};if(inmediato){modal.stop(true,true);finalizar();}else modal.stop(true,true).fadeOut(180,finalizar);}
  function tick(){const restantes=Math.max(0,Math.ceil((fin-Date.now())/1000));$('#tiempoReserva').text('00:'+String(restantes).padStart(2,'0'));if(restantes===0){cerrar();$('#estado-reservas').text('Tarifa Flash Expirada. Abre nuevamente la confirmación.');avisar('Tarifa Flash Expirada');}}
  function confirmarReserva(datos,callback){
    if(modal[0].open)cerrar(true);
    const detalle=$('#detalleConfirmacion').empty();
    const campos=[['Nombre',datos.nombre],['Servicio',datos.servicio],['Fecha y horario',datos.fecha+' · '+datos.hora],['Horas',String(datos.horas)],['Tarifa',datos.horas+' × 40 Bs'],['Complemento',datos.extra.toFixed(2)+' Bs'],['Total',datos.total.toFixed(2)+' Bs'],['Garantía incluida (20%)',(datos.total*.2).toFixed(2)+' Bs']];
    campos.forEach(([titulo,texto])=>detalle.append($('<dt>').text(titulo),$('<dd>').text(texto)));
    disparador=document.activeElement;confirmar=callback;$('#procesarReserva').prop('disabled',false);fin=Date.now()+30000;tick();modal[0].showModal();modal.stop(true,true).hide().fadeIn(180);intervalo=setInterval(tick,250);
  }
  $('#cerrarConfirmacion,#cancelarConfirmacion').off('click.modal').on('click.modal',()=>cerrar());
  modal.off('cancel.modal close.modal').on('cancel.modal',function(e){e.preventDefault();cerrar();}).on('close.modal',function(){limpiarReloj();confirmar=null;});
  $('#procesarReserva').off('click.modal').on('click.modal',function(){if(cerrando||!confirmar)return;if(Date.now()>=fin){tick();return;}$(this).prop('disabled',true);const callback=confirmar;confirmar=null;const registrado=callback();cerrar();if(registrado)avisar('Reserva confirmada y guardada localmente.');else avisar('No se pudo confirmar. Revisa el horario y los datos.');});
  function hidratar(){const header=$('header[data-hidratado]');if(header.attr('data-hidratado')==='true')return;header.attr('data-hidratado','true');$('#boton-menu,.hamburguesa,#abrir-menu').prop('disabled',false).attr('aria-busy','false');$('#estadoHidratacion').text('Interfaz interactiva lista.');}
  temporizadorHidratacion=setTimeout(hidratar,500);
  $(window).off('pagehide.ui pageshow.ui').on('pagehide.ui',function(){clearTimeout(temporizadorToast);clearTimeout(temporizadorHidratacion);cerrar(true);toast.stop(true,true).hide();}).on('pageshow.ui',function(e){if(e.originalEvent && e.originalEvent.persisted){if($('header[data-hidratado]').attr('data-hidratado')!=='true')hidratar();if(modal[0].open)cerrar(true);}});
  window.UIAvanzada=Object.freeze({confirmarReserva,hidratar});
  pintarBitacora();
  if(personal){
    const form=$('#pwaForm');
    function validar(campo){const texto=campo.value.trim();const error=campo.id==='nombre'?(texto.length<2||texto.length>80?'Escribe un nombre de 2 a 80 caracteres.':''):campo.id==='correo'?(texto.length>150||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(texto)?'Escribe un correo válido.':''):(texto.length<10||texto.length>500?'Escribe un mensaje de 10 a 500 caracteres.':'');$(campo).attr('aria-invalid',String(Boolean(error)));$('#err-'+campo.id).text(error);return !error;}
    form.off('input.contacto blur.contacto','input,textarea').on('input.contacto blur.contacto','input,textarea',function(){validar(this);$('#resultadoContacto').text('');});
    form.off('submit.contacto').on('submit.contacto',function(e){e.preventDefault();let primero;form.find('input,textarea').each(function(){if(!validar(this)&&!primero)primero=this;});if(primero){primero.focus();return;}const key='consultas-portafolio';try{let anteriores;try{anteriores=JSON.parse(localStorage.getItem(key)||'[]');}catch{anteriores=[];}const datos=(Array.isArray(anteriores)?anteriores:[]).concat({id:Date.now().toString(36),nombre:$('#nombre').val().trim(),correo:$('#correo').val().trim(),mensaje:$('#mensaje').val().trim(),creada:new Date().toISOString()}).slice(-100);localStorage.setItem(key,JSON.stringify(datos));window.dispatchEvent(new CustomEvent('datos-locales-cambiados',{detail:{contexto,clave:key,datos}}));$('#resultadoContacto').text('Consulta guardada en este navegador; no se ha enviado.');this.reset();form.find('[aria-invalid]').removeAttr('aria-invalid');avisar('Consulta guardada localmente.');}catch{$('#resultadoContacto').text('El navegador no permitió guardar. Copia tu mensaje antes de salir.');}});
  }
});
