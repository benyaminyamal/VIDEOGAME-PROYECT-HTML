/* =====================================================================
   TodoJuegos — Lógica de la tienda con JavaScript
   ---------------------------------------------------------------------
   El código está dividido en funciones claras y reutilizables:
     1. Estado y utilidades (formato de precios).
     2. Carga de datos con Fetch API (+ manejo de errores).
     3. Renderizado dinámico de productos en el DOM.
     4. Filtros por categoría y búsqueda (eventos submit/click).
     5. Carrito de compras (agregar, resumir, vaciar).
   ===================================================================== */


/* ---------------------------------------------------------------------
   1) ESTADO GLOBAL Y UTILIDADES
   --------------------------------------------------------------------- */

// Guardamos los productos cargados desde el JSON para poder filtrarlos
// sin tener que volver a pedirlos al servidor.
let productos = [];

// El carrito es un arreglo de objetos { producto, cantidad }.
let carrito = [];

/**
 * Da formato de precio en pesos chilenos (CLP).
 * @param {number} valor - Monto numérico, por ejemplo 59990.
 * @returns {string} Precio formateado, por ejemplo "$59.990".
 */
function formatearPrecio(valor) {
    return valor.toLocaleString("es-CL", {
        style: "currency",
        currency: "CLP",
        minimumFractionDigits: 0
    });
}


/* ---------------------------------------------------------------------
   2) CARGA DE DATOS EXTERNA CON FETCH API
   --------------------------------------------------------------------- */

/**
 * Carga la lista de productos desde el archivo JSON local usando Fetch API.
 * Gestiona los errores mostrando un mensaje amigable si algo falla.
 */
async function cargarProductos() {
    mostrarMensaje("Cargando productos...", "info");

    try {
        const respuesta = await fetch("productos.json");

        // fetch() no lanza error con códigos HTTP como 404; hay que revisarlo.
        if (!respuesta.ok) {
            throw new Error("No se pudo cargar el archivo (código " + respuesta.status + ")");
        }

        productos = await respuesta.json();

        ocultarMensaje();
        renderizarProductos(productos); // Mostramos los productos en pantalla
    } catch (error) {
        // Mensaje amigable para el usuario + detalle técnico en consola.
        console.error("Error al cargar productos:", error);
        mostrarMensaje(
            "😕 No pudimos cargar los productos en este momento. " +
            "Revisa tu conexión e inténtalo nuevamente más tarde.",
            "danger"
        );
    }
}

/**
 * Muestra un mensaje de estado (carga, error, sin resultados) al usuario.
 * @param {string} texto - Texto a mostrar.
 * @param {string} tipo  - Tipo de alerta Bootstrap: info, danger, warning...
 */
function mostrarMensaje(texto, tipo) {
    const caja = document.getElementById("mensajeEstado");
    caja.textContent = texto;
    caja.className = "alert alert-" + tipo; // reinicia clases y aplica el tipo
}

/** Oculta el mensaje de estado. */
function ocultarMensaje() {
    document.getElementById("mensajeEstado").className = "alert d-none";
}


/* ---------------------------------------------------------------------
   3) RENDERIZADO DINÁMICO DE PRODUCTOS EN EL DOM
   --------------------------------------------------------------------- */

/**
 * Dibuja las tarjetas de producto dentro del grid de la página.
 * @param {Array} lista - Arreglo de productos a mostrar.
 */
function renderizarProductos(lista) {
    const contenedor = document.getElementById("listaProductos");
    contenedor.innerHTML = ""; // Limpiamos antes de volver a dibujar

    // Si no hay coincidencias (por ejemplo, tras una búsqueda) avisamos.
    if (lista.length === 0) {
        mostrarMensaje("No se encontraron juegos con esos criterios.", "warning");
        return;
    }
    ocultarMensaje();

    // Creamos una tarjeta (columna Bootstrap) por cada producto.
    lista.forEach(function (producto) {
        const columna = document.createElement("div");
        columna.className = "col-12 col-sm-6 col-lg-4";

        columna.innerHTML = `
            <article class="card card-producto h-100">
                <img src="${producto.imagen}" class="card-img-top"
                     alt="Portada de ${producto.nombre}" loading="lazy">
                <div class="card-body d-flex flex-column">
                    <span class="badge badge-categoria align-self-start mb-2">
                        ${producto.categoria}
                    </span>
                    <h3 class="h6 card-title">${producto.nombre}</h3>
                    <p class="card-text small flex-grow-1">${producto.descripcion}</p>
                    <div class="d-flex justify-content-between align-items-center mt-2">
                        <span class="precio fw-bold">${formatearPrecio(producto.precio)}</span>
                        <button class="btn btn-agregar btn-sm" data-id="${producto.id}">
                            <i class="bi bi-cart-plus"></i> Agregar
                        </button>
                    </div>
                </div>
            </article>
        `;

        contenedor.appendChild(columna);
    });

    // EVENTO CLICK: enlazamos el botón "Agregar" de cada tarjeta al carrito.
    contenedor.querySelectorAll(".btn-agregar").forEach(function (boton) {
        boton.addEventListener("click", function () {
            const id = Number(this.dataset.id);
            agregarAlCarrito(id);
        });
    });
}


/* ---------------------------------------------------------------------
   4) FILTROS: CATEGORÍAS (click) Y BÚSQUEDA (submit)
   --------------------------------------------------------------------- */

/**
 * Filtra los productos por categoría al hacer click en el menú.
 * @param {string} categoria - "todos" o el nombre de la categoría.
 */
function filtrarPorCategoria(categoria) {
    if (categoria === "todos") {
        renderizarProductos(productos);
    } else {
        const filtrados = productos.filter(function (p) {
            return p.categoria === categoria;
        });
        renderizarProductos(filtrados);
    }
}

/**
 * Filtra los productos según el texto escrito en el buscador.
 * @param {string} texto - Texto de búsqueda.
 */
function buscarProductos(texto) {
    const termino = texto.trim().toLowerCase();

    // Si el campo está vacío mostramos todo el catálogo.
    if (termino === "") {
        renderizarProductos(productos);
        return;
    }

    const resultados = productos.filter(function (p) {
        return p.nombre.toLowerCase().includes(termino);
    });
    renderizarProductos(resultados);
}


/* ---------------------------------------------------------------------
   5) CARRITO DE COMPRAS
   --------------------------------------------------------------------- */

/**
 * Agrega un producto al carrito (o suma cantidad si ya existe).
 * @param {number} id - Identificador del producto a agregar.
 */
function agregarAlCarrito(id) {
    const producto = productos.find(function (p) { return p.id === id; });
    if (!producto) return;

    // ¿Ya está en el carrito? Si es así, aumentamos su cantidad.
    const itemExistente = carrito.find(function (item) {
        return item.producto.id === id;
    });

    if (itemExistente) {
        itemExistente.cantidad++;
    } else {
        carrito.push({ producto: producto, cantidad: 1 });
    }

    actualizarCarrito(); // Refrescamos el resumen y el contador
}

/**
 * Elimina por completo un producto del carrito.
 * @param {number} id - Identificador del producto a quitar.
 */
function eliminarDelCarrito(id) {
    carrito = carrito.filter(function (item) {
        return item.producto.id !== id;
    });
    actualizarCarrito();
}

/** Vacía todo el carrito de una sola vez. */
function vaciarCarrito() {
    carrito = [];
    actualizarCarrito();
}

/**
 * Recalcula y vuelve a dibujar el resumen del carrito, el total
 * y el contador de la barra de navegación.
 */
function actualizarCarrito() {
    const resumen = document.getElementById("resumenCarrito");
    const contador = document.getElementById("contadorCarrito");
    const totalEl = document.getElementById("totalCarrito");

    // Contador = suma de todas las cantidades.
    const totalUnidades = carrito.reduce(function (acc, item) {
        return acc + item.cantidad;
    }, 0);
    contador.textContent = totalUnidades;

    // Carrito vacío: mostramos un mensaje y salimos.
    if (carrito.length === 0) {
        resumen.innerHTML =
            '<p class="text-center text-secondary mt-4">Tu carrito está vacío.</p>';
        totalEl.textContent = formatearPrecio(0);
        return;
    }

    // Dibujamos cada línea del carrito.
    let html = "";
    let total = 0;

    carrito.forEach(function (item) {
        const subtotal = item.producto.precio * item.cantidad;
        total += subtotal;

        html += `
            <div class="item-carrito d-flex justify-content-between align-items-center py-2">
                <div>
                    <p class="mb-0 fw-semibold small">${item.producto.nombre}</p>
                    <small class="text-secondary">
                        ${item.cantidad} × ${formatearPrecio(item.producto.precio)}
                    </small>
                </div>
                <div class="text-end">
                    <span class="d-block small fw-bold">${formatearPrecio(subtotal)}</span>
                    <button class="btn btn-sm btn-quitar" data-id="${item.producto.id}"
                            aria-label="Quitar ${item.producto.nombre}">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });

    resumen.innerHTML = html;
    totalEl.textContent = formatearPrecio(total);

    // EVENTO CLICK: botones de "quitar" de cada línea del carrito.
    resumen.querySelectorAll(".btn-quitar").forEach(function (boton) {
        boton.addEventListener("click", function () {
            eliminarDelCarrito(Number(this.dataset.id));
        });
    });
}


/* ---------------------------------------------------------------------
   6) INICIALIZACIÓN Y REGISTRO DE EVENTOS
   --------------------------------------------------------------------- */

/**
 * Configura todos los eventos de la página una vez cargado el DOM.
 */
function inicializar() {
    // Cargamos los productos desde el JSON.
    cargarProductos();

    // EVENTO SUBMIT: formulario de búsqueda.
    document.getElementById("formBusqueda").addEventListener("submit", function (e) {
        e.preventDefault(); // Evitamos que la página se recargue
        const texto = document.getElementById("inputBusqueda").value;
        buscarProductos(texto);
    });

    // EVENTO CLICK: enlaces de categoría en la barra de navegación.
    document.querySelectorAll(".filtro-categoria").forEach(function (enlace) {
        enlace.addEventListener("click", function (e) {
            e.preventDefault();

            // Marcamos visualmente la categoría activa.
            document.querySelectorAll(".filtro-categoria").forEach(function (a) {
                a.classList.remove("active");
            });
            this.classList.add("active");

            filtrarPorCategoria(this.dataset.categoria);
        });
    });

    // EVENTO CLICK: botón para vaciar el carrito.
    document.getElementById("btnVaciar").addEventListener("click", vaciarCarrito);

    // Dejamos el carrito con su estado inicial (vacío).
    actualizarCarrito();
}

// Ejecutamos la inicialización cuando el DOM esté completamente cargado.
document.addEventListener("DOMContentLoaded", inicializar);
