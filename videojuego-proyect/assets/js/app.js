// Estado de la aplicacion
let productos = [];
let carrito = [];

// Da formato de precio en pesos chilenos
function formatearPrecio(valor) {
    return valor.toLocaleString("es-CL", {
        style: "currency",
        currency: "CLP",
        minimumFractionDigits: 0
    });
}

// Carga los productos desde el JSON local con Fetch API
async function cargarProductos() {
    mostrarMensaje("Cargando productos...", "info");

    try {
        const respuesta = await fetch("productos.json");

        if (!respuesta.ok) {
            throw new Error("No se pudo cargar el archivo (codigo " + respuesta.status + ")");
        }

        productos = await respuesta.json();
        ocultarMensaje();
        renderizarProductos(productos);
    } catch (error) {
        console.error("Error al cargar productos:", error);
        mostrarMensaje(
            "No pudimos cargar los productos en este momento. " +
            "Revisa tu conexion e intentalo nuevamente mas tarde.",
            "danger"
        );
    }
}

function mostrarMensaje(texto, tipo) {
    const caja = document.getElementById("mensajeEstado");
    caja.textContent = texto;
    caja.className = "alert alert-" + tipo;
}

function ocultarMensaje() {
    document.getElementById("mensajeEstado").className = "alert d-none";
}

// Dibuja las tarjetas de producto en el grid
function renderizarProductos(lista) {
    const contenedor = document.getElementById("listaProductos");
    contenedor.innerHTML = "";

    if (lista.length === 0) {
        mostrarMensaje("No se encontraron juegos con esos criterios.", "warning");
        return;
    }
    ocultarMensaje();

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

    contenedor.querySelectorAll(".btn-agregar").forEach(function (boton) {
        boton.addEventListener("click", function () {
            agregarAlCarrito(Number(this.dataset.id));
        });
    });
}

function filtrarPorCategoria(categoria) {
    if (categoria === "todos") {
        renderizarProductos(productos);
    } else {
        renderizarProductos(productos.filter(p => p.categoria === categoria));
    }
}

function buscarProductos(texto) {
    const termino = texto.trim().toLowerCase();

    if (termino === "") {
        renderizarProductos(productos);
        return;
    }

    const resultados = productos.filter(function (p) {
        return p.nombre.toLowerCase().includes(termino);
    });
    renderizarProductos(resultados);
}

// Agrega un producto al carrito o suma cantidad si ya existe
function agregarAlCarrito(id) {
    const producto = productos.find(p => p.id === id);
    if (!producto) return;

    const itemExistente = carrito.find(item => item.producto.id === id);

    if (itemExistente) {
        itemExistente.cantidad++;
    } else {
        carrito.push({ producto: producto, cantidad: 1 });
    }

    actualizarCarrito();
}

function eliminarDelCarrito(id) {
    carrito = carrito.filter(item => item.producto.id !== id);
    actualizarCarrito();
}

function vaciarCarrito() {
    carrito = [];
    actualizarCarrito();
}

// Vuelve a dibujar el resumen del carrito y el total
function actualizarCarrito() {
    const resumen = document.getElementById("resumenCarrito");
    const contador = document.getElementById("contadorCarrito");
    const totalEl = document.getElementById("totalCarrito");

    const totalUnidades = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    contador.textContent = totalUnidades;

    if (carrito.length === 0) {
        resumen.innerHTML =
            '<p class="text-center text-secondary mt-4">Tu carrito esta vacio.</p>';
        totalEl.textContent = formatearPrecio(0);
        return;
    }

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
                        ${item.cantidad} x ${formatearPrecio(item.producto.precio)}
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

    resumen.querySelectorAll(".btn-quitar").forEach(function (boton) {
        boton.addEventListener("click", function () {
            eliminarDelCarrito(Number(this.dataset.id));
        });
    });
}

// Configuracion de eventos al cargar la pagina
function inicializar() {
    cargarProductos();

    document.getElementById("formBusqueda").addEventListener("submit", function (e) {
        e.preventDefault();
        buscarProductos(document.getElementById("inputBusqueda").value);
    });

    document.querySelectorAll(".filtro-categoria").forEach(function (enlace) {
        enlace.addEventListener("click", function (e) {
            e.preventDefault();
            document.querySelectorAll(".filtro-categoria").forEach(a => a.classList.remove("active"));
            this.classList.add("active");
            filtrarPorCategoria(this.dataset.categoria);
        });
    });

    document.getElementById("btnVaciar").addEventListener("click", vaciarCarrito);

    actualizarCarrito();
}

document.addEventListener("DOMContentLoaded", inicializar);
