$(function () {
  if (window.__catalogosListos) return;
  window.__catalogosListos = true;
  const catalogo = 'ponky-fase-ui-pwa';
  const configuracion = window.CATALOGO_PERSONALIZADO;
  const productos = configuracion.productos;

  const reducirMovimiento = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  $.fx.off = reducirMovimiento;

  const claveFavoritos = "favoritos-ponky-fase-ui-pwa";

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
        width: 640, height: 480, decoding: "async",
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
      $("<small>").text(configuracion.categorias[producto.categoria]),
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
      producto.descripcion
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
    $("#menu").stop(true,true).slideUp(180);
    $(".hamburguesa").attr("aria-expanded","false").attr("aria-label","Abrir menú").text("☰");
    if(devolverFoco)$(".hamburguesa").trigger("focus");
  }
  $(".hamburguesa").off("click.catalogo").on("click.catalogo",function(){
    const abierto=$(this).attr("aria-expanded")==="true";
    $(this).attr("aria-expanded",String(!abierto)).attr("aria-label",abierto?"Abrir menú":"Cerrar menú").text(abierto?"☰":"✕");
    $("#menu").stop(true,true).slideToggle(180);
  });
  $(document).off("click.catalogo").on("click.catalogo",function(e){if(!$(e.target).closest("#menu,.hamburguesa").length)cerrarMenu();});
  $(document).off("keydown.catalogo").on("keydown.catalogo",function(e){if(e.key==="Escape"&&$(".hamburguesa").attr("aria-expanded")==="true")cerrarMenu(true);});
  $("#menu").off("click.catalogo","a").on("click.catalogo","a",()=>cerrarMenu());

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