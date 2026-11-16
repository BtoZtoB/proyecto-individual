/* Bloques de las guías adaptados a turnos de consulta y productos/proyectos.
   Toda entrada del usuario se inserta con .text(); nunca como HTML. */
$(function () {
  'use strict';
  if (window.__modulosListos) return;
  window.__modulosListos = true;
  const destino = $('#modulos-practicos');
  if (!destino.length) return;
  const contexto = $('body').attr('data-catalogo');
  const esPortafolio = contexto === 'portafolio';
  const claveReservas = 'turnos-seguros-' + contexto;
  const claveLista = 'intereses-seguros-' + contexto;
  const opciones = esPortafolio
    ? ['Catálogo elegante', 'Catálogo moderno', 'Catálogo creativo', 'Catálogo minimalista']
    : ['Consulta de productos', 'Atención personalizada', 'Presentación del catálogo'];
  const maximo = 100;
  let secuencia = 0;
  function nuevoId() { return Date.now().toString(36) + '-' + (++secuencia); }
  function fechaLocal() {
    const hoy = new Date();
    return hoy.getFullYear() + '-' + String(hoy.getMonth() + 1).padStart(2, '0') + '-' + String(hoy.getDate()).padStart(2, '0');
  }
  function leer(clave, validar) {
    try {
      const datos = JSON.parse(localStorage.getItem(clave) || '[]');
      return Array.isArray(datos) ? datos.filter(validar).slice(0, maximo) : [];
    } catch { return []; }
  }
  function esTexto(valor, limite) { return typeof valor === 'string' && valor.trim().length > 0 && valor.length <= limite; }
  function esFecha(valor) {
    if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
    const fecha = new Date(valor + 'T12:00:00');
    return !Number.isNaN(fecha.getTime()) && fecha.toISOString().slice(0, 10) === valor;
  }
  const horarios = Array.from({length:9}, (_,i) => String(i+9).padStart(2,'0') + ':00');
  let reservas = leer(claveReservas, item => item && esTexto(item.id, 60) && esTexto(item.nombre, 80)
    && opciones.includes(item.servicio) && esFecha(item.fecha) && horarios.includes(item.hora))
    .map(item => ({...item, horas: Number.isInteger(item.horas) && item.horas >= 1 && item.horas <= 8 ? item.horas : 1}));
  let intereses = leer(claveLista, item => item && esTexto(item.id, 60) && esTexto(item.texto, 300));

  // Esta plantilla es constante; no se interpola contenido de formularios ni del almacenamiento.
  destino.append(`
    <div class="titulo-modulos">
      <span class="etiqueta">PLANIFICA TU CONSULTA</span>
      <h2>Turnos y lista de interés</h2>
      <p>Organiza tu visita y anota lo que deseas consultar. Los datos se guardan solo en este navegador; no se envían a una empresa ni confirman una cita real.</p>
    </div>
    <div class="bloques-practicos">
      <section class="modulo-reservas bloque-practico" aria-labelledby="titulo-reservas">
        <h3 id="titulo-reservas">Reservar un turno de consulta</h3>
        <form id="formReserva" novalidate>
          <label for="clienteNombre">Nombre o grupo</label>
          <input id="clienteNombre" name="nombre" type="text" autocomplete="name" placeholder="Escribe tu nombre" required minlength="2" maxlength="80" aria-describedby="error-reserva">
          <label for="salaSelect">Motivo de consulta</label>
          <select id="salaSelect" name="servicio" required></select>
          <div class="campos-turno">
            <div><label for="fechaReserva">Fecha</label><input id="fechaReserva" name="fecha" type="date" required></div>
            <div><label for="horaReserva">Horario</label><select id="horaReserva" name="hora" required>

            </select></div>
          </div>
          <label for="hrs">Duración de la sesión (40 Bs/h, tarifa de demostración)</label>
          <input id="hrs" type="number" min="1" max="8" step="1" value="1" inputmode="numeric" required>
          <label for="extraReserva">Complemento de demostración</label>
          <select id="extraReserva"><option value="0">Sin complemento — 0 Bs</option><option value="10">Material de apoyo — 10 Bs</option><option value="20">Material ampliado — 20 Bs</option></select>
          <div class="resumen-pedido" aria-labelledby="tituloResumen"><h4 id="tituloResumen">Resumen de la reserva</h4><p id="resumenServicio"></p><p id="resumenDesglose"></p><p>Total: <strong><span id="total">40.00</span> Bs</strong></p><p id="resumenGarantia"></p></div>
          <div id="grillaHorarios" class="grilla-horarios" role="group" aria-label="Horarios disponibles en este navegador"></div>
          <p class="nota-horarios">Disponible / Ocupado se calcula solo con tus registros de este navegador.</p>
          <p id="error-reserva" class="error-modulo" role="alert"></p>
          <button type="submit" class="btn-accion">Revisar y confirmar reserva</button>
        </form>
        <p id="estado-reservas" class="estado-modulo" role="status"></p>
        <p id="sin-reservas" class="vacio-modulo">Todavía no hay turnos guardados.</p>
        <ul id="listaReservas" class="lista-segura" aria-label="Turnos guardados"></ul>
      </section>
      <section class="cola-intereses bloque-practico" aria-labelledby="titulo-lista">
        <h3 id="titulo-lista">Mi lista de interés</h3>
        <p>Anota los productos que quieres consultar. Puedes agregar y quitar elementos.</p>
        <form id="formInteres" novalidate>
          <label for="inputInteres">Producto o consulta</label>
          <div class="entrada-interes">
            <input id="inputInteres" type="text" maxlength="300" required placeholder="Escribe un producto o consulta…" aria-describedby="error-interes">
            <button id="btnPedir" type="submit" class="btn-tactil">+ Agregar</button>
          </div>
          <p id="error-interes" class="error-modulo" role="alert"></p>
        </form>
        <p id="estado-intereses" class="estado-modulo" role="status"></p>
        <p id="sin-intereses" class="vacio-modulo">Tu lista está vacía.</p>
        <ul id="listaIntereses" class="lista-segura" aria-label="Lista de interés"></ul>
      </section>
    </div>
  `);
  if (esPortafolio) {
    $('#titulo-lista').text('Mis proyectos de interés');
    $('#titulo-lista').next('p').text('Anota los proyectos o ideas sobre los que quieres consultar. Puedes agregar y quitar elementos.');
    $('label[for="inputInteres"]').text('Proyecto o idea');
    $('#inputInteres').attr('placeholder', 'Escribe un proyecto o idea…');
  }
  opciones.forEach(opcion => $('#salaSelect').append($('<option>').val(opcion).text(opcion)));
  horarios.forEach(hora => $('#horaReserva').append($('<option>').val(hora).text(hora)));
  $('#fechaReserva').attr('min', fechaLocal()).val(fechaLocal());

  function guardar(clave, datos, estado, mensaje) {
    try {
      localStorage.setItem(clave, JSON.stringify(datos));
      window.dispatchEvent(new CustomEvent("datos-locales-cambiados", {detail:{contexto,clave,datos}}));
      $(estado).text(mensaje);
    } catch {
      $(estado).text(mensaje + ' El navegador no permite guardar; este cambio durará mientras la página siga abierta.');
    }
  }
  function pintarReservas() {
    const lista = $('#listaReservas').empty();
    reservas.forEach(item => {
      const fila = $('<li>').addClass('item-reserva').attr('data-id', item.id);
      const contenido = $('<div>').addClass('texto-reserva');
      contenido.append(
        $('<strong>').addClass('titulo-truncado').text(item.nombre).attr('title', item.nombre),
        $('<span>').addClass('detalle-reserva').text(item.servicio + ' · ' + item.fecha + ' · ' + item.hora + ' · ' + item.horas + ' h' + (Number.isFinite(item.total) ? ' · ' + item.total.toFixed(2) + ' Bs' : ''))
      );
      const quitar = $('<button>').attr({type: 'button', 'aria-label': 'Cancelar turno de ' + item.nombre}).addClass('btn-tactil cancelar-reserva').text('Cancelar');
      fila.append(contenido, quitar); lista.append(fila);
    });
    $('#sin-reservas').prop('hidden', reservas.length > 0);
  }
  function pintarIntereses() {
    const lista = $('#listaIntereses').empty();
    intereses.forEach(item => {
      const fila = $('<li>').addClass('fila-interes').attr('data-id', item.id);
      const titulo = $('<span>').addClass('titulo-truncado').text(item.texto).attr('title', item.texto);
      const quitar = $('<button>').attr({type:'button', 'aria-label': 'Quitar de la lista: ' + item.texto}).addClass('btn-tactil btn-quitar').text('✕');
      fila.append(titulo, quitar); lista.append(fila);
    });
    $('#sin-intereses').prop('hidden', intereses.length > 0);
  }
  function datosTurno() {
    const horas = Number($('#hrs').val());
    const extra = Number($('#extraReserva').val());
    return {nombre:$('#clienteNombre').val().trim(),servicio:$('#salaSelect').val(),fecha:$('#fechaReserva').val(),hora:$('#horaReserva').val(),horas,extra,tarifa:40,total:horas*40+extra};
  }
  function ocupado(datos) {
    const inicio = Number(datos.hora.slice(0,2)),fin=inicio+datos.horas;
    return reservas.some(item => item.servicio===datos.servicio && item.fecha===datos.fecha && inicio<Number(item.hora.slice(0,2))+item.horas && fin>Number(item.hora.slice(0,2)));
  }
  function errorTurno(datos) {
    if(datos.nombre.length<2 || datos.nombre.length>80) return ['Escribe un nombre de 2 a 80 caracteres.','#clienteNombre'];
    if(!opciones.includes(datos.servicio)) return ['Selecciona un motivo válido.','#salaSelect'];
    if(!esFecha(datos.fecha) || datos.fecha<fechaLocal()) return ['Elige una fecha válida de hoy en adelante.','#fechaReserva'];
    if(!horarios.includes(datos.hora) || datos.fecha+'T'+datos.hora<=fechaLocal()+'T'+new Date().toTimeString().slice(0,5)) return ['Elige un horario futuro.','#horaReserva'];
    if(!Number.isInteger(datos.horas)||datos.horas<1||datos.horas>8) return ['Elige entre 1 y 8 horas completas.','#hrs'];
    if(Number(datos.hora.slice(0,2))+datos.horas>18) return ['La sesión debe terminar a las 18:00 como máximo.','#hrs'];
    if(![0,10,20].includes(datos.extra)) return ['Selecciona un complemento válido.','#extraReserva'];
    if(reservas.length>=maximo) return ['Alcanzaste el límite de 100 turnos. Cancela uno para continuar.','#clienteNombre'];
    if(ocupado(datos)) return ['Ese turno ya está guardado o se cruza con otra reserva. Elige otro horario.','#horaReserva'];
    return null;
  }
  function resumen() {
    const datos=datosTurno(),valido=Number.isInteger(datos.horas)&&datos.horas>=1&&datos.horas<=8&&[0,10,20].includes(datos.extra);
    $('#total').text(valido?datos.total.toFixed(2):'—');
    $('#resumenServicio').text(datos.servicio+' · '+(datos.fecha||'Elige una fecha')+' · '+datos.hora);
    $('#resumenDesglose').text(valido?datos.horas+' h × 40 Bs + complemento '+datos.extra.toFixed(2)+' Bs':'Elige una duración válida.');
    $('#resumenGarantia').text(valido?'Garantía de ejemplo (20% incluida en el total): '+(datos.total*.2).toFixed(2)+' Bs. No se procesa ningún cobro.':'');
    const grid=$('#grillaHorarios').empty();
    horarios.forEach(hora=>{
      const alternativa={...datos,hora};
      const bloqueado=!valido || Number(hora.slice(0,2))+datos.horas>18 || ocupado(alternativa) || datos.fecha+'T'+hora<=fechaLocal()+'T'+new Date().toTimeString().slice(0,5);
      const boton=$('<button>').attr({type:'button','data-hora':hora,'aria-pressed':String(datos.hora===hora),disabled:bloqueado}).addClass('horario-turno').toggleClass('ocupado',bloqueado).toggleClass('seleccionado',datos.hora===hora).text(hora+' · '+(bloqueado?'Ocupado':'Disponible'));
      grid.append(boton);
    });
  }
  $('#formReserva').off('submit.turnos').on('submit.turnos', function(evento){
    evento.preventDefault(); $('#error-reserva').text(''); $('#estado-reservas').text('');
    const datos=datosTurno(),error=errorTurno(datos);
    if(error){$('#error-reserva').text(error[0]);$(error[1]).attr('aria-invalid','true').trigger('focus');return;}
    $('#formReserva [aria-invalid]').removeAttr('aria-invalid');
    window.UIAvanzada.confirmarReserva(datos,()=>{
      const actual=errorTurno(datos);
      if(actual){$('#error-reserva').text(actual[0]);return false;}
      reservas.push({id:nuevoId(),...datos});pintarReservas();
      guardar(claveReservas,reservas,'#estado-reservas','Reserva confirmada y guardada en este navegador.');
      $('#formReserva')[0].reset();$('#fechaReserva').attr('min',fechaLocal()).val(fechaLocal());resumen();
      return true;
    });
  });
  $('#formReserva').off('input.turnos change.turnos','input, select').on('input.turnos change.turnos','input, select',function(){ $(this).removeAttr('aria-invalid');$('#error-reserva').text('');resumen(); });
  $('#grillaHorarios').off('click.turnos','[data-hora]').on('click.turnos','[data-hora]',function(){$('#horaReserva').val($(this).attr('data-hora')).trigger('change');});
  // Delegación: un único listener por lista, también para filas creadas más tarde.
  $('#listaReservas').off('click.turnos', '.cancelar-reserva').on('click.turnos', '.cancelar-reserva', function () {
    const id = $(this).closest('.item-reserva').attr('data-id');
    reservas = reservas.filter(item => item.id !== id); pintarReservas(); resumen();
    guardar(claveReservas, reservas, '#estado-reservas', 'Turno cancelado.');
    $('#clienteNombre').trigger('focus');
  });
  $('#formInteres').off('submit.intereses').on('submit.intereses', function (evento) {
    evento.preventDefault();
    const texto = $('#inputInteres').val().trim();
    $('#error-interes').text(''); $('#estado-intereses').text('');
    if (!texto || texto.length > 300 || intereses.length >= maximo) {
      $('#error-interes').text(intereses.length >= maximo ? 'Alcanzaste el límite de 100 elementos.' : 'Escribe un texto de 1 a 300 caracteres.');
      $('#inputInteres').attr('aria-invalid','true').trigger('focus'); return;
    }
    intereses.push({id:nuevoId(), texto}); pintarIntereses();
    guardar(claveLista, intereses, '#estado-intereses', 'Elemento agregado.');
    $('#inputInteres').val('').removeAttr('aria-invalid').trigger('focus');
  });
  $('#inputInteres').off('input.intereses').on('input.intereses', function () { $(this).removeAttr('aria-invalid'); $('#error-interes').text(''); });
  $('#listaIntereses').off('click.intereses', '.btn-quitar').on('click.intereses', '.btn-quitar', function () {
    const id = $(this).closest('.fila-interes').attr('data-id');
    intereses = intereses.filter(item => item.id !== id); pintarIntereses();
    guardar(claveLista, intereses, '#estado-intereses', 'Elemento quitado.');
    $('#inputInteres').trigger('focus');
  });
  $(window).off('storage.turnos').on('storage.turnos',function(evento){
    const key=evento.originalEvent.key;
    if(key===claveReservas){reservas=leer(claveReservas,item=>item&&esTexto(item.nombre,80)&&opciones.includes(item.servicio)&&esFecha(item.fecha)&&horarios.includes(item.hora)).map(item=>({...item,horas:Number.isInteger(item.horas)&&item.horas>=1&&item.horas<=8?item.horas:1}));pintarReservas();resumen();}
  });
  pintarReservas(); pintarIntereses(); resumen();
});
