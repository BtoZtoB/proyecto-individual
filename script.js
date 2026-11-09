$(function () {
  const redes = {
    whatsapp: "https://wa.me/59178802923?text=Hola%20soy%20Bryan",
    facebook: "https://www.facebook.com/share/19hZwoBxzv/",
    tiktok: "https://www.tiktok.com/@btoztob",
    github: "https://github.com/BtoZtoB"
  };

  const nombresRedes = {
    whatsapp: "WhatsApp",
    facebook: "Facebook",
    tiktok: "TikTok",
    github: "GitHub"
  };

  $.fx.off = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  let temporizadorAviso;

  function mostrarAviso(mensaje) {
    clearTimeout(temporizadorAviso);

    $("#aviso")
      .stop(true, true)
      .text(mensaje)
      .fadeIn(180);

    temporizadorAviso = setTimeout(function () {
      $("#aviso").fadeOut(200);
    }, 3500);
  }

  // MENÚ HAMBURGUESA
  function cerrarMenu(devolverFoco = false) {
    $("#menu").stop(true, true).slideUp(180);

    $("#boton-menu")
      .removeClass("abierto")
      .attr("aria-expanded", "false")
      .attr("aria-label", "Abrir menú");

    if (devolverFoco) {
      $("#boton-menu").trigger("focus");
    }
  }

  $("#boton-menu").on("click", function () {
    const abierto = $(this).attr("aria-expanded") === "true";

    $(this)
      .toggleClass("abierto", !abierto)
      .attr("aria-expanded", String(!abierto))
      .attr("aria-label", abierto ? "Abrir menú" : "Cerrar menú");

    $("#menu").stop(true, true).slideToggle(180);
  });

  $("#menu a").on("click", function () {
    cerrarMenu();
  });

  $(document).on("click", function (evento) {
    if (!$(evento.target).closest("#menu, #boton-menu").length) {
      cerrarMenu();
    }
  });

  $(document).on("keydown", function (evento) {
    if (
      evento.key === "Escape" &&
      $("#boton-menu").attr("aria-expanded") === "true"
    ) {
      cerrarMenu(true);
    }
  });

  // INFORMACIÓN ADICIONAL
  $("#boton-info").on("click", function () {
    const abierto = $(this).attr("aria-expanded") === "true";

    $(this)
      .attr("aria-expanded", String(!abierto))
      .text(abierto ? "Más sobre mí" : "Ver menos");

    $("#informacion-extra")
      .stop(true, true)
      .slideToggle(200);
  });

  // IMÁGENES PROVISIONALES
  $("img[data-respaldo]").each(function () {
    const imagen = this;
    const elemento = $(imagen);

    function mostrarReemplazo() {
      elemento.hide();

      if (!elemento.siblings(".reemplazo-imagen").length) {
        const reemplazo = $("<div>")
          .addClass("reemplazo-imagen")
          .append(
            $("<span>")
              .attr("aria-hidden", "true")
              .text("▧"),

            $("<strong>")
              .text(elemento.attr("data-respaldo")),

            $("<small>")
              .text("Espacio para tu imagen")
          );

        elemento.after(reemplazo);
      }

      elemento.siblings(".reemplazo-imagen").show();
    }

    function mostrarImagen() {
      elemento.show();
      elemento.siblings(".reemplazo-imagen").hide();
    }

    elemento
      .on("error", mostrarReemplazo)
      .on("load", mostrarImagen);

    if (imagen.complete) {
      if (imagen.naturalWidth > 0) {
        mostrarImagen();
      } else {
        mostrarReemplazo();
      }
    }
  });

  // FILTROS DE PROYECTOS
  $(".filtro").on("click", function () {
    const filtro = $(this).attr("data-filtro");
    let cantidad = 0;

    $(".filtro")
      .removeClass("activo")
      .attr("aria-pressed", "false");

    $(this)
      .addClass("activo")
      .attr("aria-pressed", "true");

    $(".proyecto").each(function () {
      const visible =
        filtro === "todos" ||
        $(this).attr("data-estilo") === filtro;

      if (visible) {
        $(this).show();
        cantidad++;
      } else {
        $(this).hide();
      }
    });

    $("#contador").text(
      cantidad === 1 ? "1 proyecto" : cantidad + " proyectos"
    );

    $("body").css("background-color", "");
  });

  // COLORES DEL FONDO
  const coloresProyectos = {
    elegante: "#e1e7ed",
    moderno: "#d7e3f0",
    creativo: "#dce9e9"
  };

  $(".proyecto").on("mouseenter focusin", function () {
    const estilo = $(this).attr("data-estilo");

    $("body").css(
      "background-color",
      coloresProyectos[estilo] || "#eef1f5"
    );
  });

  $(".proyecto").on("mouseleave", function () {
    if (!this.contains(document.activeElement)) {
      $("body").css("background-color", "");
    }
  });

  $(".proyecto").on("focusout", function (evento) {
    if (
      !this.contains(evento.relatedTarget) &&
      !$(this).is(":hover")
    ) {
      $("body").css("background-color", "");
    }
  });

  // REDES SOCIALES
  $("[data-red]").on("click", function () {
    const red = $(this).attr("data-red");
    const enlace = redes[red];

    if (enlace) {
      window.open(
        enlace,
        "_blank",
        "noopener,noreferrer"
      );
    } else {
      mostrarAviso(
        "El enlace de " + nombresRedes[red] + " está pendiente."
      );
    }
  });

  $("#anio").text(new Date().getFullYear());
});