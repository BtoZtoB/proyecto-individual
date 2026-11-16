$(function () {
  if (window.__catalogosListos) return;
  window.__catalogosListos = true;
  // ENLACES: personaliza los de cada empresa.
  const redes = {
    whatsapp: "",
    facebook: "",
    tiktok: ""
  };

  // Reconoce el catálogo según su estructura.
  const esModerno = $("#abrir-menu").length > 0;

  const catalogo = $("body").attr("data-catalogo");

  const colores = {
    "4": ["#e0eeee", "#e8edf1", "#e3eee8", "#e8e5f0", "#e7eef0", "#e4eceb"],
    "1": [
      "#eee4d7", "#eadfe9", "#e0e9df",
      "#dfe7ef", "#f2e8ce", "#e7dff0"
    ],
    "2": [
      "#1b263c", "#30203b", "#18352f",
      "#392c22", "#29243e", "#19323c"
    ],
    "3": [
      "#f7d5bd", "#eadcf6", "#dce9c8",
      "#f7d5e2", "#d9e8f7", "#f8e6b5"
    ]
  };

  const configuracion = window.CATALOGO_PERSONALIZADO || null;
  const productosBase = [
    {
      id: 1,
      nombre: "Producto 1",
      categoria: "1",
      precio: 100,
      descripcion: "Espacio para una descripción breve."
    },
    {
      id: 2,
      nombre: "Producto 2",
      categoria: "1",
      precio: 150,
      descripcion: "Espacio para una descripción breve."
    },
    {
      id: 3,
      nombre: "Producto 3",
      categoria: "2",
      precio: 200,
      descripcion: "Espacio para una descripción breve."
    },
    {
      id: 4,
      nombre: "Producto 4",
      categoria: "2",
      precio: 250,
      descripcion: "Espacio para una descripción breve."
    },
    {
      id: 5,
      nombre: "Producto 5",
      categoria: "3",
      precio: 300,
      descripcion: "Espacio para una descripción breve."
    },
    {
      id: 6,
      nombre: "Producto 6",
      categoria: "3",
      precio: 350,
      descripcion: "Espacio para una descripción breve."
    }
  ];
  const productos = (configuracion ? configuracion.productos : productosBase).map(function (producto, indice) {
    return {
      ...producto,
      color: producto.color || colores[catalogo][indice],
      imagen: producto.imagen || "../assets/img/producto" + producto.id + ".svg"
    };
  });

  const reducirMovimiento = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  $.fx.off = reducirMovimiento;

  const claveFavoritos = "favoritos-catalogo-" + catalogo;

  let favoritos = cargarFavoritos();
  let categoria = "todos";
  let soloFavoritos = false;
  let orden = "original";
  let temporizadorAviso;

  function cargarFavoritos() {
    try {
      const datos = JSON.parse(
        localStorage.getItem(claveFavoritos) || "[]"
      );

      return Array.isArray(datos)
        ? [...new Set(datos.filter(id => Number.isInteger(id)))]
        : [];
    } catch {
      return [];
    }
  }

  function guardarFavoritos() {
    try {
      localStorage.setItem(
        claveFavoritos,
        JSON.stringify(favoritos)
      );
      window.dispatchEvent(new CustomEvent("datos-locales-cambiados", {detail:{contexto:catalogo,clave:claveFavoritos,datos:favoritos}}));
    } catch {
      mostrarAviso(
        "Los favoritos estarán disponibles mientras esta página siga abierta."
      );
    }
  }

  function precio(valor) {
    return Number.isFinite(valor) ? "Bs " + valor.toFixed(2) : "Precio por confirmar";
  }

  function normalizar(texto) {
    return texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function mostrarAviso(texto) {
    clearTimeout(temporizadorAviso);

    $("#aviso")
      .stop(true, true)
      .text(texto)
      .fadeIn(180);

    temporizadorAviso = setTimeout(function () {
      $("#aviso").fadeOut(200);
    }, 3200);
  }

  // CONTROLES DE ORDEN Y FAVORITOS
  $("#contador").before(`
    <div class="herramientas-extra">
      <label for="orden-productos">
        Ordenar:
        <select id="orden-productos">
          <option value="original">Orden original</option>
          <option value="menor">Menor precio</option>
          <option value="mayor">Mayor precio</option>
          <option value="nombre">Nombre A–Z</option>
        </select>
      </label>

      <button id="ver-favoritos" class="boton-favoritos"
        type="button" aria-pressed="false">
      </button>
    </div>
  `);

  function actualizarBotonFavoritos() {
    const cantidad = productos.filter(function (producto) {
      return favoritos.includes(producto.id);
    }).length;

    $("#ver-favoritos")
      .toggleClass("seleccionado", soloFavoritos)
      .attr("aria-pressed", String(soloFavoritos))
      .text(
        (soloFavoritos ? "♥ Mostrando favoritos" : "♡ Ver favoritos") +
        " (" + cantidad + ")"
      );
  }

  // IMÁGENES Y ESPACIOS PROVISIONALES
  function prepararImagenes(contenedor) {
    $(contenedor).find("img").each(function () {
      const imagen = this;

      function reemplazar() {
        if ($(imagen).siblings(".placeholder").length) return;

        $(imagen).hide().after(
          $("<div>").addClass("placeholder").append(
            $("<span>").attr("aria-hidden", "true").text("▧"),
            $("<strong>").text(imagen.alt)
          )
        );
      }

      $(imagen).off("error.plantilla").off("error.plantilla.catalogo").on("error.plantilla.catalogo",
        reemplazar
      );

      if (imagen.complete && !imagen.naturalWidth) {
        reemplazar();
      }
    });
  }

  function crearTarjeta(producto) {
    const guardado = favoritos.includes(producto.id);

    const tarjeta = $("<article>")
      .addClass("producto")
      .attr("data-id", producto.id)
      .css("--color", producto.color);

    const imagen = $("<div>").addClass("imagen-producto");

    imagen.append(
      $("<img>").attr({
        src: producto.imagen,
        alt: "Imagen de " + producto.nombre,
        loading: "lazy"
      })
    );

    const favorito = $("<button>")
      .addClass("favorito")
      .toggleClass("guardado", guardado)
      .attr({
        type: "button",
        "data-favorito": producto.id,
        "aria-pressed": String(guardado),
        "aria-label":
          (guardado ? "Quitar de favoritos: " : "Guardar en favoritos: ") +
          producto.nombre
      })
      .text(guardado ? "♥" : "♡");

    imagen.append(favorito);

    const informacion = $("<div>").addClass("info-producto");
    const pie = $("<div>").addClass("producto-pie");

    pie.append(
      $("<strong>").text(precio(producto.precio)),
      $("<button>")
        .attr({
          type: "button",
          "data-detalle": producto.id,
          "aria-label": "Ver detalles de " + producto.nombre
        })
        .text("Ver detalles ↗")
    );

    informacion.append(
      $("<small>").text(configuracion ? configuracion.categorias[producto.categoria] : "CATEGORÍA " + producto.categoria),
      $("<h3>").text(producto.nombre).attr("title", producto.nombre),
      $("<p>").text(producto.descripcion),
      pie
    );

    tarjeta.append(imagen, informacion);

    return tarjeta;
  }

  // FILTROS, BÚSQUEDA Y ORDEN
  function actualizarCatalogo() {
    const texto = normalizar($("#buscar").val() || "");

    const resultados = productos.filter(function (producto) {
      const coincideCategoria =
        categoria === "todos" ||
        producto.categoria === categoria;

      const coincideBusqueda = normalizar(
        producto.nombre + " categoria " +
        producto.categoria + " " + producto.descripcion
      ).includes(texto);

      const coincideFavoritos =
        !soloFavoritos ||
        favoritos.includes(producto.id);

      return coincideCategoria &&
        coincideBusqueda &&
        coincideFavoritos;
    });

    if (orden === "menor") {
      resultados.sort((a, b) => !Number.isFinite(a.precio) ? (Number.isFinite(b.precio) ? 1 : 0) : !Number.isFinite(b.precio) ? -1 : a.precio - b.precio);
    } else if (orden === "mayor") {
      resultados.sort((a, b) => !Number.isFinite(a.precio) ? (Number.isFinite(b.precio) ? 1 : 0) : !Number.isFinite(b.precio) ? -1 : b.precio - a.precio);
    } else if (orden === "nombre") {
      resultados.sort(function (a, b) {
        return a.nombre.localeCompare(
          b.nombre,
          "es",
          { numeric: true }
        );
      });
    }

    const contenedor = $("#productos").empty();

    resultados.forEach(function (producto) {
      contenedor.append(crearTarjeta(producto));
    });

    $("#contador").text(
      resultados.length === 1
        ? "1 producto disponible"
        : resultados.length + " productos disponibles"
    );

    $("#vacio")
      .prop("hidden", resultados.length > 0)
      .text(
        soloFavoritos
          ? "No hay favoritos que coincidan con estos filtros."
          : "No se encontraron productos con esta búsqueda."
      );

    actualizarBotonFavoritos();
    prepararImagenes("#productos");
    window.dispatchEvent(new CustomEvent("catalogo-renderizado"));
    $("body").css("background-color", "");
  }

  $(".filtros button").off("click.catalogo").on("click.catalogo", function () {
    categoria = $(this).attr("data-categoria");

    $(".filtros button")
      .removeClass("activo")
      .attr("aria-pressed", "false");

    $(this)
      .addClass("activo")
      .attr("aria-pressed", "true");

    actualizarCatalogo();
  });

  $("#buscar").off("input.catalogo").on("input.catalogo", actualizarCatalogo);

  $("#orden-productos").off("change.catalogo").on("change.catalogo", function () {
    orden = $(this).val();
    actualizarCatalogo();
  });

  $("#ver-favoritos").off("click.catalogo").on("click.catalogo", function () {
    soloFavoritos = !soloFavoritos;
    actualizarCatalogo();
  });

  // GUARDAR Y QUITAR FAVORITOS
  $("#productos").off("click.catalogo", "[data-favorito]").on("click.catalogo", "[data-favorito]", function () {
    const id = Number($(this).attr("data-favorito"));
    const guardado = favoritos.includes(id);

    if (guardado) {
      favoritos = favoritos.filter(item => item !== id);
    } else {
      favoritos.push(id);
    }

    guardarFavoritos();

    if (soloFavoritos) {
      actualizarCatalogo();

      // Conserva un punto de navegación accesible.
      $("#ver-favoritos").trigger("focus");
    } else {
      const producto = productos.find(item => item.id === id);

      $(this)
        .toggleClass("guardado", !guardado)
        .attr("aria-pressed", String(!guardado))
        .attr(
          "aria-label",
          (guardado ? "Guardar en favoritos: " : "Quitar de favoritos: ") +
          producto.nombre
        )
        .text(guardado ? "♡" : "♥");

      actualizarBotonFavoritos();
    }
  });

  // CAMBIO DE FONDO
  $("#productos").off("mouseenter.catalogo focusin.catalogo", ".producto").on("mouseenter.catalogo focusin.catalogo", ".producto", function () {
    const id = Number($(this).attr("data-id"));
    const producto = productos.find(item => item.id === id);

    $("body").css("background-color", producto.color);
  });

  $("#productos").off("mouseleave.catalogo", ".producto").on("mouseleave.catalogo", ".producto", function () {
    if (!this.contains(document.activeElement)) {
      $("body").css("background-color", "");
    }
  });

  $("#productos").off("focusout.catalogo", ".producto").on("focusout.catalogo", ".producto", function (evento) {
    if (
      !this.contains(evento.relatedTarget) &&
      !$(this).is(":hover")
    ) {
      $("body").css("background-color", "");
    }
  });

  // DETALLES
  const modal = document.getElementById("detalle");

  $("#productos").off("click.catalogo", "[data-detalle]").on("click.catalogo", "[data-detalle]", function () {
    const id = Number($(this).attr("data-detalle"));
    const producto = productos.find(item => item.id === id);

    $("#detalle-titulo").text(producto.nombre);
    $("#detalle-texto").text(
      configuracion ? producto.descripcion : "Espacio para las características y los detalles de " + producto.nombre + "."
    );
    $("#detalle-precio").text(precio(producto.precio));

    modal.showModal();
    window.dispatchEvent(new CustomEvent("producto-detalle", {detail:{producto}}));
  });

  $("#cerrar").off("click.catalogo").on("click.catalogo", function () {
    modal.close();
  });

  // MENÚ
  function cerrarMenu(devolverFoco = false) {
    if (esModerno) {
      $("#menu").stop(true, true).hide(180);
      $("#fondo-menu").prop("hidden", true);
      $("#abrir-menu").attr("aria-expanded", "false");

      if (devolverFoco) {
        $("#abrir-menu").trigger("focus");
      }
    } else {
      $("#menu").stop(true, true).slideUp(180);

      $(".hamburguesa")
        .attr("aria-expanded", "false")
        .attr("aria-label", "Abrir menú")
        .text("☰");

      if (devolverFoco) {
        $(".hamburguesa").trigger("focus");
      }
    }
  }

  if (esModerno) {
    $("#abrir-menu").off("click.catalogo").on("click.catalogo", function () {
      $("#menu").stop(true, true).show(180);
      $("#fondo-menu").prop("hidden", false);
      $(this).attr("aria-expanded", "true");
      $("#menu").promise().done(() => $("#cerrar-menu").trigger("focus"));
    });

    $("#cerrar-menu").off("click.catalogo").on("click.catalogo", () => cerrarMenu(true));
    $("#fondo-menu").off("click.catalogo").on("click.catalogo", () => cerrarMenu());
  } else {
    $(".hamburguesa").off("click.catalogo").on("click.catalogo", function () {
      const abierto = $(this).attr("aria-expanded") === "true";

      $(this)
        .attr("aria-expanded", String(!abierto))
        .attr("aria-label", abierto ? "Abrir menú" : "Cerrar menú")
        .text(abierto ? "☰" : "✕");

      $("#menu").stop(true, true).slideToggle(180);
    });

    $(document).off("click.catalogo").on("click.catalogo", function (evento) {
      if (!$(evento.target).closest("#menu,.hamburguesa").length) {
        cerrarMenu();
      }
    });
  }

  $("#menu a").off("click.catalogo").on("click.catalogo", () => cerrarMenu());

  $(document).off("keydown.catalogo").on("keydown.catalogo", function (evento) {
    const boton = esModerno ? $("#abrir-menu") : $(".hamburguesa");

    if (
      evento.key === "Escape" &&
      boton.attr("aria-expanded") === "true"
    ) {
      cerrarMenu(true);
    }
  });

  if (esModerno) {
    $("#menu").off("keydown.catalogo").on("keydown.catalogo", function (evento) {
      if (evento.key !== "Tab") return;
      const controles = $(this).find('a, button').filter(':visible');
      const primero = controles[0], ultimo = controles[controles.length - 1];
      if (evento.shiftKey && document.activeElement === primero) {
        evento.preventDefault(); ultimo.focus();
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault(); primero.focus();
      }
    });
  }

  // CARRUSEL
  let slideActual = 0;
  let pausado = reducirMovimiento;
  let intervalo;
  let temporizadorFoco;

  function mostrarSlide(indice) {
    const slides = $(".slide");
    slideActual = (indice + slides.length) % slides.length;

    slides
      .prop("hidden", true)
      .eq(slideActual)
      .prop("hidden", false);

    $("#numero-slide").text(
      String(slideActual + 1).padStart(2, "0") +
      " / " +
      String(slides.length).padStart(2, "0")
    );
  }

  function iniciarCarrusel() {
    clearInterval(intervalo);

    const carrusel = document.querySelector(".carrusel");

    if (
      (carrusel.closest('dialog') && !carrusel.closest('dialog').open) ||
      (carrusel.closest('[role=tabpanel]') && carrusel.closest('[role=tabpanel]').hidden) ||
      pausado ||
      document.hidden ||
      $(".carrusel").is(":hover") ||
      carrusel.contains(document.activeElement)
    ) {
      return;
    }

    intervalo = setInterval(function () {
      mostrarSlide(slideActual + 1);
    }, 5000);
  }

  $("#anterior").off("click.catalogo").on("click.catalogo", () => mostrarSlide(slideActual - 1));
  $("#siguiente").off("click.catalogo").on("click.catalogo", () => mostrarSlide(slideActual + 1));

  $("#pausa")
    .text(pausado ? "Reanudar" : "Pausar")
    .off("click.catalogo").on("click.catalogo", function () {
      pausado = !pausado;
      $(this).text(pausado ? "Reanudar" : "Pausar");
      iniciarCarrusel();
    });

  $(".carrusel")
    .off("mouseenter.catalogo focusin.catalogo").on("mouseenter.catalogo focusin.catalogo", () => clearInterval(intervalo))
    .off("mouseleave.catalogo").on("mouseleave.catalogo", iniciarCarrusel)
    .off("focusout.catalogo").on("focusout.catalogo", () => { clearTimeout(temporizadorFoco); temporizadorFoco = setTimeout(iniciarCarrusel, 0); });

  document.addEventListener("visibilitychange", iniciarCarrusel);

  // INFORMACIÓN ADICIONAL
  const textoMas = $("#ver-mas").text();

  $("#ver-mas").off("click.catalogo").on("click.catalogo", function () {
    const abierto = $(this).attr("aria-expanded") === "true";

    $(this)
      .attr("aria-expanded", String(!abierto))
      .text(abierto ? textoMas : "Ver menos");

    $("#extra").stop(true, true).slideToggle(200);
  });

  // REDES SOCIALES
  $("[data-red]").off("click.catalogo").on("click.catalogo", function () {
    const red = $(this).attr("data-red");

    if (redes[red]) {
      window.open(redes[red], "_blank", "noopener,noreferrer");
    } else {
      mostrarAviso(
        "Enlace de " + red + " pendiente de personalización."
      );
    }
  });

  // FORMULARIO: SE AGREGA A LA SECCIÓN DE CONTACTO
  const formulario = $(`
    <form id="formulario-contacto" class="formulario-catalogo" novalidate>
      <h3>Consulta sobre el catálogo</h3>

      <p class="nota-formulario">
        Tu consulta se guarda en este navegador.
        Todavía no se envía a la empresa.
      </p>

      <label for="nombre-contacto">Nombre</label>
      <input
        id="nombre-contacto"
        name="nombre"
        type="text"
        autocomplete="name"
        placeholder="Escribe tu nombre"
        minlength="2"
        maxlength="80"
        aria-describedby="error-nombre"
        required>
      <small id="error-nombre" class="error-campo" aria-live="polite"></small>

      <label for="correo-contacto">Correo electrónico</label>
      <input
        id="correo-contacto"
        name="correo"
        type="email"
        autocomplete="email"
        placeholder="nombre@correo.com"
        maxlength="150"
        aria-describedby="error-correo"
        required>
      <small id="error-correo" class="error-campo" aria-live="polite"></small>

      <label for="mensaje-contacto">Mensaje</label>
      <textarea
        id="mensaje-contacto"
        name="mensaje"
        placeholder="¿Qué te gustaría consultar?"
        minlength="10"
        maxlength="500"
        aria-describedby="error-mensaje contador-mensaje"
        required></textarea>
      <small id="error-mensaje" class="error-campo" aria-live="polite"></small>

      <div id="contador-mensaje" class="contador-mensaje">
        0 / 500 caracteres
      </div>

      <button class="enviar-formulario" type="submit">
        Guardar consulta
      </button>

      <p id="resultado-formulario"
        class="resultado-formulario" role="status"></p>
    </form>
  `);

  $("#contacto .redes").after(formulario);

  function validarCampo(campo) {
    const elemento = $(campo);
    const valor = elemento.val().trim();
    let error = "";

    if (campo.name === "nombre") {
      if (!valor) {
        error = "Escribe tu nombre.";
      } else if (valor.length < 2) {
        error = "El nombre debe tener al menos 2 caracteres.";
      } else if (valor.length > 80) {
        error = "El nombre no puede superar 80 caracteres.";
      }
    }

    if (campo.name === "correo") {
      if (!valor) {
        error = "Escribe tu correo electrónico.";
      } else if (campo.validity.typeMismatch || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
        error = "Escribe un correo válido, por ejemplo nombre@correo.com.";
      } else if (valor.length > 150) {
        error = "El correo es demasiado largo.";
      }
    }

    if (campo.name === "mensaje") {
      if (!valor) {
        error = "Escribe tu consulta.";
      } else if (valor.length < 10) {
        error = "El mensaje debe tener al menos 10 caracteres.";
      } else if (valor.length > 500) {
        error = "El mensaje no puede superar 500 caracteres.";
      }
    }

    elemento
      .toggleClass("campo-invalido", Boolean(error))
      .toggleClass("campo-valido", !error)
      .attr("aria-invalid", String(Boolean(error)));

    $("#error-" + campo.name).text(error);

    return !error;
  }

  formulario.find("input, textarea").off("input.catalogo blur.catalogo").on("input.catalogo blur.catalogo", function () {
    validarCampo(this);
    $("#resultado-formulario").text("");
  });

  $("#mensaje-contacto").off("input.catalogo").on("input.catalogo", function () {
    $("#contador-mensaje").text(
      $(this).val().length + " / 500 caracteres"
    );
  });

  formulario.off("submit.catalogo").on("submit.catalogo", function (evento) {
    evento.preventDefault();

    let primerError = null;

    formulario.find("input, textarea").each(function () {
      if (!validarCampo(this) && !primerError) {
        primerError = this;
      }
    });

    if (primerError) {
      $("#resultado-formulario").text(
        "Revisa los campos marcados antes de continuar."
      );
      primerError.focus();
      return;
    }

    const clave = "consultas-catalogo-" + catalogo;
    const consulta = {
      id: Date.now().toString(36) + "-" + Math.random().toString(36).slice(2),
      nombre: $("#nombre-contacto").val().trim(),
      correo: $("#correo-contacto").val().trim(),
      mensaje: $("#mensaje-contacto").val().trim(),
      creada: new Date().toISOString()
    };
    try {
      let anteriores;
      try { anteriores = JSON.parse(localStorage.getItem(clave) || "[]"); } catch { anteriores = []; }
      const datos = (Array.isArray(anteriores) ? anteriores : []).concat(consulta).slice(-100);
      localStorage.setItem(clave, JSON.stringify(datos));
      window.dispatchEvent(new CustomEvent("datos-locales-cambiados", {detail:{contexto:catalogo,clave,datos}}));
      $("#resultado-formulario").text("Datos validados correctamente. Consulta guardada en este navegador; no se ha enviado a la empresa.");
      formulario[0].reset();
      formulario.find(".campo-valido").removeClass("campo-valido");
      $("#contador-mensaje").text("0 / 500 caracteres");
    } catch {
      $("#resultado-formulario").text("Datos válidos, pero el navegador no permitió guardar. Copia tu consulta antes de salir.");
    }
  });

  $(window).off("pagehide.catalogo pageshow.catalogo").on("pagehide.catalogo", function () {
    clearInterval(intervalo); clearTimeout(temporizadorAviso); clearTimeout(temporizadorFoco);
    $("#aviso").stop(true, true).hide();
  }).on("pageshow.catalogo", iniciarCarrusel);

  // INICIO
  $("#anio").text(new Date().getFullYear());
  prepararImagenes(".carrusel");
  actualizarCatalogo();
  mostrarSlide(0);
  iniciarCarrusel();
});