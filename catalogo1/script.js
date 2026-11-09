$(function () {
  // ENLACES: personaliza los de cada empresa.
  const redes = {
    whatsapp: "",
    facebook: "",
    tiktok: ""
  };

  // Reconoce el catálogo según su estructura.
  const esModerno = $("#abrir-menu").length > 0;
  const esCreativo = $(".titulo-portada").length > 0;

  const catalogo = esModerno ? "2" : esCreativo ? "3" : "1";

  const colores = {
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

  const productos = [
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
  ].map(function (producto, indice) {
    return {
      ...producto,
      color: colores[catalogo][indice],
      imagen: "img/producto" + producto.id + ".jpg"
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
    } catch {
      mostrarAviso(
        "Los favoritos estarán disponibles mientras esta página siga abierta."
      );
    }
  }

  function precio(valor) {
    return "Bs " + valor.toFixed(2);
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

  // ESTILOS DE LAS NUEVAS FUNCIONES
  $("<style>").text(`
    .herramientas-extra {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px;
      margin: 20px 0;
    }

    .herramientas-extra label {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 10px;
      font-size: 12px;
    }

    .herramientas-extra select,
    .boton-favoritos {
      min-height: 42px;
      padding: 10px 13px;
      border: 1px solid var(--borde);
      border-radius: 9px;
      background: ${esModerno ? "#191d28" : "#ffffff"};
      color: var(--texto);
      font: inherit;
      font-size: 12px;
    }

    .boton-favoritos {
      cursor: pointer;
    }

    .boton-favoritos.seleccionado {
      background: ${esModerno ? "#9cbbff" : "#302d28"};
      color: ${esModerno ? "#101219" : "#ffffff"};
    }

    .imagen-producto {
      position: relative;
    }

    .favorito {
      position: absolute;
      top: 12px;
      right: 12px;
      z-index: 1;
      display: grid;
      place-items: center;
      width: 38px;
      height: 38px;
      padding: 0;
      border: 1px solid #bfc5cf;
      border-radius: 50%;
      background: #ffffff;
      color: #354052;
      font-size: 23px;
      cursor: pointer;
      box-shadow: 0 3px 10px #0001;
    }

    .favorito.guardado {
      color: #ad3151;
      background: #fff0f4;
      border-color: #d58a9e;
    }

    .formulario-catalogo {
      max-width: 650px;
      margin: 45px auto 0;
      padding: clamp(20px, 4vw, 35px);
      border: 1px solid var(--borde);
      border-radius: 16px;
      background: ${esModerno ? "#191d28" : "#ffffff"};
      color: var(--texto);
      text-align: left;
    }

    .formulario-catalogo h3 {
      margin: 0 0 12px;
      font-size: 24px;
    }

    .formulario-catalogo .nota-formulario {
      margin-bottom: 25px;
      font-size: 12px;
    }

    .formulario-catalogo label {
      display: block;
      margin: 18px 0 8px;
      font-size: 13px;
      font-weight: bold;
    }

    .formulario-catalogo input,
    .formulario-catalogo textarea {
      display: block;
      width: 100%;
      padding: 13px;
      border: 1px solid ${esModerno ? "#65738a" : "#bfc5cf"};
      border-radius: 8px;
      background: ${esModerno ? "#101219" : "#fafafa"};
      color: var(--texto);
      font: inherit;
      font-size: 14px;
    }

    .formulario-catalogo textarea {
      min-height: 120px;
      resize: vertical;
    }

    .formulario-catalogo .campo-invalido {
      border: 2px solid ${esModerno ? "#ff9dae" : "#ad3151"};
    }

    .formulario-catalogo .campo-valido {
      border: 2px solid ${esModerno ? "#83d6af" : "#26734f"};
    }

    .error-campo {
      display: block;
      min-height: 17px;
      margin-top: 6px;
      color: ${esModerno ? "#ffadba" : "#ad3151"};
      font-size: 11px;
      line-height: 1.5;
    }

    .contador-mensaje {
      text-align: right;
      font-size: 11px;
      color: var(--suave);
    }

    .formulario-catalogo .enviar-formulario {
      width: 100%;
      margin-top: 20px;
      padding: 14px;
      border: 0;
      border-radius: 9px;
      background: ${esModerno ? "#9cbbff" : "#302d28"};
      color: ${esModerno ? "#101219" : "#ffffff"};
      font: inherit;
      font-size: 13px;
      font-weight: bold;
      cursor: pointer;
    }

    .resultado-formulario {
      margin-bottom: 0;
      font-size: 13px;
      color: ${esModerno ? "#83d6af" : "#26734f"};
    }

    @media (max-width: 600px) {
      .herramientas-extra {
        align-items: stretch;
        flex-direction: column;
      }

      .herramientas-extra select {
        flex: 1;
        min-width: 0;
      }
    }
  `).appendTo("head");

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

      $(imagen).off("error.plantilla").on(
        "error.plantilla",
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
      $("<small>").text("CATEGORÍA " + producto.categoria),
      $("<h3>").text(producto.nombre),
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
      resultados.sort((a, b) => a.precio - b.precio);
    } else if (orden === "mayor") {
      resultados.sort((a, b) => b.precio - a.precio);
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
    $("body").css("background-color", "");
  }

  $(".filtros button").on("click", function () {
    categoria = $(this).attr("data-categoria");

    $(".filtros button")
      .removeClass("activo")
      .attr("aria-pressed", "false");

    $(this)
      .addClass("activo")
      .attr("aria-pressed", "true");

    actualizarCatalogo();
  });

  $("#buscar").on("input", actualizarCatalogo);

  $("#orden-productos").on("change", function () {
    orden = $(this).val();
    actualizarCatalogo();
  });

  $("#ver-favoritos").on("click", function () {
    soloFavoritos = !soloFavoritos;
    actualizarCatalogo();
  });

  // GUARDAR Y QUITAR FAVORITOS
  $("#productos").on("click", "[data-favorito]", function () {
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
  $("#productos").on("mouseenter focusin", ".producto", function () {
    const id = Number($(this).attr("data-id"));
    const producto = productos.find(item => item.id === id);

    $("body").css("background-color", producto.color);
  });

  $("#productos").on("mouseleave", ".producto", function () {
    if (!this.contains(document.activeElement)) {
      $("body").css("background-color", "");
    }
  });

  $("#productos").on("focusout", ".producto", function (evento) {
    if (
      !this.contains(evento.relatedTarget) &&
      !$(this).is(":hover")
    ) {
      $("body").css("background-color", "");
    }
  });

  // DETALLES
  const modal = document.getElementById("detalle");

  $("#productos").on("click", "[data-detalle]", function () {
    const id = Number($(this).attr("data-detalle"));
    const producto = productos.find(item => item.id === id);

    $("#detalle-titulo").text(producto.nombre);
    $("#detalle-texto").text(
      "Espacio para las características y los detalles de " +
      producto.nombre + "."
    );
    $("#detalle-precio").text(precio(producto.precio));

    modal.showModal();
  });

  $("#cerrar").on("click", function () {
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
    $("#abrir-menu").on("click", function () {
      $("#menu").stop(true, true).show(180);
      $("#fondo-menu").prop("hidden", false);
      $(this).attr("aria-expanded", "true");
      $("#cerrar-menu").trigger("focus");
    });

    $("#cerrar-menu").on("click", () => cerrarMenu(true));
    $("#fondo-menu").on("click", () => cerrarMenu());
  } else {
    $(".hamburguesa").on("click", function () {
      const abierto = $(this).attr("aria-expanded") === "true";

      $(this)
        .attr("aria-expanded", String(!abierto))
        .attr("aria-label", abierto ? "Abrir menú" : "Cerrar menú")
        .text(abierto ? "☰" : "✕");

      $("#menu").stop(true, true).slideToggle(180);
    });

    $(document).on("click", function (evento) {
      if (!$(evento.target).closest("#menu,.hamburguesa").length) {
        cerrarMenu();
      }
    });
  }

  $("#menu a").on("click", () => cerrarMenu());

  $(document).on("keydown", function (evento) {
    const boton = esModerno ? $("#abrir-menu") : $(".hamburguesa");

    if (
      evento.key === "Escape" &&
      boton.attr("aria-expanded") === "true"
    ) {
      cerrarMenu(true);
    }
  });

  // CARRUSEL
  let slideActual = 0;
  let pausado = reducirMovimiento;
  let intervalo;

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

  $("#anterior").on("click", () => mostrarSlide(slideActual - 1));
  $("#siguiente").on("click", () => mostrarSlide(slideActual + 1));

  $("#pausa")
    .text(pausado ? "Reanudar" : "Pausar")
    .on("click", function () {
      pausado = !pausado;
      $(this).text(pausado ? "Reanudar" : "Pausar");
      iniciarCarrusel();
    });

  $(".carrusel")
    .on("mouseenter focusin", () => clearInterval(intervalo))
    .on("mouseleave", iniciarCarrusel)
    .on("focusout", () => setTimeout(iniciarCarrusel, 0));

  document.addEventListener("visibilitychange", iniciarCarrusel);

  // INFORMACIÓN ADICIONAL
  const textoMas = $("#ver-mas").text();

  $("#ver-mas").on("click", function () {
    const abierto = $(this).attr("aria-expanded") === "true";

    $(this)
      .attr("aria-expanded", String(!abierto))
      .text(abierto ? textoMas : "Ver menos");

    $("#extra").stop(true, true).slideToggle(200);
  });

  // REDES SOCIALES
  $("[data-red]").on("click", function () {
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
        Formulario de demostración: valida los datos,
        pero todavía no envía mensajes.
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
        Validar consulta
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
      } else if (campo.validity.typeMismatch) {
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

  formulario.find("input, textarea").on("input blur", function () {
    validarCampo(this);
    $("#resultado-formulario").text("");
  });

  $("#mensaje-contacto").on("input", function () {
    $("#contador-mensaje").text(
      $(this).val().length + " / 500 caracteres"
    );
  });

  formulario.on("submit", function (evento) {
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

    $("#resultado-formulario").text(
      "Datos validados correctamente. Esta demostración no envía el mensaje."
    );
  });

  // INICIO
  $("#anio").text(new Date().getFullYear());
  prepararImagenes(".carrusel");
  actualizarCatalogo();
  mostrarSlide(0);
  iniciarCarrusel();
});