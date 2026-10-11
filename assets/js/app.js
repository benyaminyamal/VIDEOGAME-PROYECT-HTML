const { useState, useEffect } = React;

// Formatea un numero como precio en pesos chilenos
function formatearPrecio(valor) {
    return Number(valor).toLocaleString("es-CL", {
        style: "currency", currency: "CLP", minimumFractionDigits: 0
    });
}

// Imagen de reemplazo (SVG) para juegos agregados sin URL de imagen
function imagenPorDefecto(nombre) {
    const svg = "<svg xmlns='http://www.w3.org/2000/svg' width='400' height='500'>" +
        "<rect width='100%' height='100%' fill='#2e1064'/>" +
        "<text x='50%' y='50%' fill='#c4b5fd' font-family='Arial' font-size='26' " +
        "text-anchor='middle'>" + (nombre || "Videojuego") + "</text></svg>";
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}


// ===================== COMPONENTE: Barra de navegacion =====================
function Navbar({ categorias, categoria, setCategoria, busqueda, setBusqueda, totalUnidades }) {
    return (
        <nav className="navbar navbar-expand-lg navbar-dark sticky-top py-3">
            <div className="container">
                <a className="navbar-brand fw-bold" href="inicio.html">
                    <i className="bi bi-controller"></i> TodoJuegos
                </a>

                <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
                        data-bs-target="#menuPrincipal" aria-controls="menuPrincipal"
                        aria-expanded="false" aria-label="Abrir menú de navegación">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="menuPrincipal">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        {categorias.map((cat) => (
                            <li className="nav-item" key={cat.valor}>
                                <a
                                    className={"nav-link" + (categoria === cat.valor ? " active" : "")}
                                    href="#productos"
                                    onClick={() => setCategoria(cat.valor)}
                                >
                                    {cat.texto}
                                </a>
                            </li>
                        ))}
                        <li className="nav-item">
                            <a className="nav-link" href="#contacto">Contacto</a>
                        </li>
                    </ul>

                    <form className="d-flex me-lg-3 my-2 my-lg-0" role="search"
                          onSubmit={(e) => e.preventDefault()}>
                        <input className="form-control me-2" type="search"
                               placeholder="Buscar juego..." aria-label="Buscar"
                               value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
                        <button className="btn btn-outline-light" type="submit">
                            <i className="bi bi-search"></i>
                        </button>
                    </form>

                    <button className="btn btn-carrito position-relative" type="button"
                            data-bs-toggle="offcanvas" data-bs-target="#carritoPanel">
                        <i className="bi bi-cart3 fs-5"></i>
                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark">
                            {totalUnidades}
                        </span>
                    </button>
                </div>
            </div>
        </nav>
    );
}


// ===================== COMPONENTE: Cabecera / Hero =====================
function Hero() {
    return (
        <header className="hero text-center text-white py-5">
            <div className="container">
                <h1 className="display-4 fw-bold">TodoJuegos</h1>
                <p className="lead mx-auto" style={{ maxWidth: "700px" }}>
                    Tienda de videojuegos contemporáneos donde puedes encontrar todo
                    lo que necesitas para disfrutar al máximo.
                </p>
            </div>
        </header>
    );
}


// ===================== COMPONENTE: Tarjeta de un videojuego =====================
// Recibe por props el producto y las funciones para agregar al carrito / eliminar.
function TarjetaVideojuego({ producto, enCarrito, onToggleCarrito, onEliminarJuego }) {
    return (
        <div className="col-12 col-sm-6 col-lg-4">
            <article className="card card-producto h-100">
                <button className="btn-eliminar-juego" title="Eliminar del catálogo"
                        onClick={() => onEliminarJuego(producto.id)}>
                    <i className="bi bi-x-lg"></i>
                </button>
                <img src={producto.imagen} className="card-img-top"
                     alt={"Portada de " + producto.nombre} loading="lazy" />
                <div className="card-body d-flex flex-column">
                    <span className="badge badge-categoria align-self-start mb-2">
                        {producto.categoria}
                    </span>
                    <h3 className="h6 card-title">{producto.nombre}</h3>
                    <p className="card-text small flex-grow-1">{producto.descripcion}</p>
                    <div className="d-flex justify-content-between align-items-center mt-2">
                        <span className="precio fw-bold">{formatearPrecio(producto.precio)}</span>
                        <button
                            className={enCarrito ? "btn btn-success btn-sm" : "btn btn-agregar btn-sm"}
                            onClick={() => onToggleCarrito(producto)}
                        >
                            {enCarrito
                                ? <span><i className="bi bi-check2"></i> En el carrito</span>
                                : <span><i className="bi bi-cart-plus"></i> Agregar</span>}
                        </button>
                    </div>
                </div>
            </article>
        </div>
    );
}


// ===================== COMPONENTE: Lista de videojuegos =====================
// Recorre los productos y crea una TarjetaVideojuego por cada uno.
function ListaVideojuegos({ productos, cargando, error, estaEnCarrito, onToggleCarrito, onEliminarJuego }) {
    if (cargando) return <div className="alert alert-info">Cargando productos...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;
    if (productos.length === 0) {
        return <div className="alert alert-warning">No se encontraron juegos con esos criterios.</div>;
    }

    return (
        <div className="row g-4">
            {productos.map((producto) => (
                <TarjetaVideojuego
                    key={producto.id}
                    producto={producto}
                    enCarrito={estaEnCarrito(producto.id)}
                    onToggleCarrito={onToggleCarrito}
                    onEliminarJuego={onEliminarJuego}
                />
            ))}
        </div>
    );
}


// ===================== COMPONENTE: Formulario para agregar un videojuego =====================
function FormularioAgregarJuego({ onAgregar }) {
    const [datos, setDatos] = useState({ nombre: "", categoria: "Acción", precio: "", descripcion: "", imagen: "" });
    const [errores, setErrores] = useState({});

    function handleChange(e) {
        setDatos({ ...datos, [e.target.name]: e.target.value });
    }

    // Valida los campos obligatorios antes de agregar
    function validar() {
        const err = {};
        if (!datos.nombre.trim()) err.nombre = "El nombre es obligatorio.";
        if (!datos.precio || isNaN(Number(datos.precio)) || Number(datos.precio) <= 0) {
            err.precio = "Ingresa un precio válido (número mayor a 0).";
        }
        if (!datos.descripcion.trim()) err.descripcion = "La descripción es obligatoria.";
        return err;
    }

    function handleSubmit(e) {
        e.preventDefault();
        const err = validar();
        setErrores(err);
        if (Object.keys(err).length === 0) {
            onAgregar({
                nombre: datos.nombre.trim(),
                categoria: datos.categoria,
                precio: Number(datos.precio),
                descripcion: datos.descripcion.trim(),
                imagen: datos.imagen.trim() || imagenPorDefecto(datos.nombre.trim())
            });
            setDatos({ nombre: "", categoria: "Acción", precio: "", descripcion: "", imagen: "" });
            setErrores({});
        }
    }

    return (
        <form className="row g-3" onSubmit={handleSubmit} noValidate>
            <div className="col-md-6">
                <label className="form-label">Nombre</label>
                <input name="nombre" className={"form-control" + (errores.nombre ? " is-invalid" : "")}
                       value={datos.nombre} onChange={handleChange} />
                {errores.nombre && <div className="invalid-feedback">{errores.nombre}</div>}
            </div>
            <div className="col-md-3">
                <label className="form-label">Categoría</label>
                <select name="categoria" className="form-select" value={datos.categoria} onChange={handleChange}>
                    <option>Acción</option>
                    <option>RPG</option>
                    <option>Aventura</option>
                </select>
            </div>
            <div className="col-md-3">
                <label className="form-label">Precio (CLP)</label>
                <input name="precio" type="number" className={"form-control" + (errores.precio ? " is-invalid" : "")}
                       value={datos.precio} onChange={handleChange} />
                {errores.precio && <div className="invalid-feedback">{errores.precio}</div>}
            </div>
            <div className="col-12">
                <label className="form-label">Descripción</label>
                <input name="descripcion" className={"form-control" + (errores.descripcion ? " is-invalid" : "")}
                       value={datos.descripcion} onChange={handleChange} />
                {errores.descripcion && <div className="invalid-feedback">{errores.descripcion}</div>}
            </div>
            <div className="col-12">
                <label className="form-label">URL de imagen (opcional)</label>
                <input name="imagen" className="form-control" placeholder="https://..."
                       value={datos.imagen} onChange={handleChange} />
            </div>
            <div className="col-12">
                <button type="submit" className="btn btn-agregar">
                    <i className="bi bi-plus-circle"></i> Agregar al catálogo
                </button>
            </div>
        </form>
    );
}


// ===================== COMPONENTE: Carrito (offcanvas) =====================
function Carrito({ carrito, onCambiarCantidad, onQuitar, onVaciar, totalPrecio }) {
    return (
        <div className="offcanvas offcanvas-end" tabIndex="-1" id="carritoPanel"
             aria-labelledby="tituloCarrito">
            <div className="offcanvas-header">
                <h5 className="offcanvas-title" id="tituloCarrito">
                    <i className="bi bi-cart3"></i> Tu carrito
                </h5>
                <button type="button" className="btn-close btn-close-white"
                        data-bs-dismiss="offcanvas" aria-label="Cerrar"></button>
            </div>
            <div className="offcanvas-body d-flex flex-column">
                <div className="flex-grow-1">
                    {/* Renderizado condicional: mensaje si el carrito esta vacio */}
                    {carrito.length === 0 ? (
                        <p className="text-center text-secondary mt-4">Tu carrito está vacío.</p>
                    ) : (
                        carrito.map((item) => (
                            <div className="item-carrito d-flex justify-content-between align-items-center py-2" key={item.id}>
                                <div>
                                    <p className="mb-0 fw-semibold small">{item.nombre}</p>
                                    <small className="text-secondary">
                                        {item.cantidad} × {formatearPrecio(item.precio)}
                                    </small>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    <button className="btn btn-sm btn-outline-light py-0" onClick={() => onCambiarCantidad(item.id, -1)}>-</button>
                                    <span>{item.cantidad}</span>
                                    <button className="btn btn-sm btn-outline-light py-0" onClick={() => onCambiarCantidad(item.id, 1)}>+</button>
                                    <button className="btn btn-sm btn-quitar" onClick={() => onQuitar(item.id)}>
                                        <i className="bi bi-trash"></i>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="border-top pt-3 mt-3">
                    <div className="d-flex justify-content-between fs-5 fw-bold mb-3">
                        <span>Total:</span>
                        <span>{formatearPrecio(totalPrecio)}</span>
                    </div>
                    <button className="btn btn-comprar w-100" onClick={onVaciar}>
                        Vaciar carrito
                    </button>
                </div>
            </div>
        </div>
    );
}


// ===================== COMPONENTE: Formulario de contacto =====================
function FormularioContacto() {
    const [datos, setDatos] = useState({ nombre: "", correo: "", mensaje: "" });
    const [errores, setErrores] = useState({});
    const [enviado, setEnviado] = useState(false);

    function handleChange(e) {
        setDatos({ ...datos, [e.target.name]: e.target.value });
        setEnviado(false);
    }

    // Valida los datos antes de "enviar" el formulario
    function validar() {
        const err = {};
        if (!datos.nombre.trim()) err.nombre = "Por favor ingresa tu nombre.";

        const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo);
        if (!datos.correo.trim()) err.correo = "Por favor ingresa tu correo.";
        else if (!correoValido) err.correo = "El correo no tiene un formato válido.";

        if (!datos.mensaje.trim()) err.mensaje = "Por favor escribe un mensaje.";
        else if (datos.mensaje.trim().length < 10) err.mensaje = "El mensaje debe tener al menos 10 caracteres.";

        return err;
    }

    function handleSubmit(e) {
        e.preventDefault();
        const err = validar();
        setErrores(err);
        if (Object.keys(err).length === 0) {
            setEnviado(true);
            setDatos({ nombre: "", correo: "", mensaje: "" });
        }
    }

    return (
        <section id="contacto" className="container my-5">
            <h2 className="titulo-seccion mb-4">Contacto</h2>
            <div className="panel-form p-4">
                {enviado && (
                    <div className="alert alert-success">
                        ¡Gracias! Tu mensaje fue enviado correctamente.
                    </div>
                )}
                <form onSubmit={handleSubmit} noValidate>
                    <div className="mb-3">
                        <label className="form-label">Nombre</label>
                        <input name="nombre" className={"form-control" + (errores.nombre ? " is-invalid" : "")}
                               value={datos.nombre} onChange={handleChange} />
                        {errores.nombre && <div className="invalid-feedback">{errores.nombre}</div>}
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Correo electrónico</label>
                        <input name="correo" type="email" className={"form-control" + (errores.correo ? " is-invalid" : "")}
                               value={datos.correo} onChange={handleChange} />
                        {errores.correo && <div className="invalid-feedback">{errores.correo}</div>}
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Mensaje</label>
                        <textarea name="mensaje" rows="4" className={"form-control" + (errores.mensaje ? " is-invalid" : "")}
                                  value={datos.mensaje} onChange={handleChange}></textarea>
                        {errores.mensaje && <div className="invalid-feedback">{errores.mensaje}</div>}
                    </div>
                    <button type="submit" className="btn btn-comprar">
                        <i className="bi bi-send"></i> Enviar mensaje
                    </button>
                </form>
            </div>
        </section>
    );
}


// ===================== COMPONENTE: Pie de pagina =====================
function PieDePagina() {
    return (
        <footer className="text-center py-4 mt-5 pie">
            <div className="container">
                <p className="mb-1">TodoJuegos — Av. Providencia 1234, Santiago, Chile</p>
                <p className="mb-2">Teléfono: +56 9 1234 5678 | Correo: contacto@todojuegos.cl</p>
                <p className="mb-0">
                    Síguenos:
                    <a href="https://instagram.com" target="_blank" rel="noopener">
                        <i className="bi bi-instagram"></i> Instagram</a> |
                    <a href="https://facebook.com" target="_blank" rel="noopener">
                        <i className="bi bi-facebook"></i> Facebook</a> |
                    <a href="https://twitter.com" target="_blank" rel="noopener">
                        <i className="bi bi-twitter-x"></i> X (Twitter)</a>
                </p>
            </div>
        </footer>
    );
}


// ===================== COMPONENTE PRINCIPAL =====================
function App() {
    // Estado principal de la aplicacion
    const [productos, setProductos] = useState([]);
    const [carrito, setCarrito] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [categoria, setCategoria] = useState("todos");
    const [busqueda, setBusqueda] = useState("");

    // Carga los videojuegos desde el JSON al iniciar
    useEffect(() => {
        fetch("productos.json")
            .then((res) => {
                if (!res.ok) throw new Error("No se pudo cargar el archivo");
                return res.json();
            })
            .then((datos) => {
                setProductos(datos);
                setCargando(false);
            })
            .catch(() => {
                setError("No pudimos cargar los productos en este momento. Intenta mas tarde.");
                setCargando(false);
            });
    }, []);

    // Lista filtrada por categoria y por el texto del buscador
    const productosFiltrados = productos.filter((p) => {
        const coincideCategoria = categoria === "todos" || p.categoria === categoria;
        const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
        return coincideCategoria && coincideBusqueda;
    });

    const estaEnCarrito = (id) => carrito.some((item) => item.id === id);
    const totalUnidades = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    const totalPrecio = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

    function alternarCarrito(producto) {
        if (estaEnCarrito(producto.id)) {
            setCarrito(carrito.filter((item) => item.id !== producto.id));
        } else {
            setCarrito([...carrito, { ...producto, cantidad: 1 }]);
        }
    }

    function cambiarCantidad(id, delta) {
        setCarrito(
            carrito
                .map((item) => (item.id === id ? { ...item, cantidad: item.cantidad + delta } : item))
                .filter((item) => item.cantidad > 0)
        );
    }

    function quitarDelCarrito(id) {
        setCarrito(carrito.filter((item) => item.id !== id));
    }

    function vaciarCarrito() {
        setCarrito([]);
    }

    // Agrega un nuevo videojuego al catalogo (estado)
    function agregarJuego(nuevo) {
        const nuevoId = productos.length ? Math.max(...productos.map((p) => p.id)) + 1 : 1;
        setProductos([...productos, { id: nuevoId, ...nuevo }]);
    }

    // Elimina un videojuego del catalogo (y del carrito si estaba)
    function eliminarJuego(id) {
        setProductos(productos.filter((p) => p.id !== id));
        setCarrito(carrito.filter((item) => item.id !== id));
    }

    const categorias = [
        { valor: "todos", texto: "Inicio" },
        { valor: "Acción", texto: "Acción" },
        { valor: "RPG", texto: "RPG" },
        { valor: "Aventura", texto: "Aventura" }
    ];

    return (
        <React.Fragment>
            <Navbar
                categorias={categorias}
                categoria={categoria}
                setCategoria={setCategoria}
                busqueda={busqueda}
                setBusqueda={setBusqueda}
                totalUnidades={totalUnidades}
            />

            <Hero />

            <main className="container my-5" id="productos">
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                    <h2 className="titulo-seccion mb-0">Productos destacados</h2>
                    <button className="btn btn-outline-light btn-sm" type="button"
                            data-bs-toggle="collapse" data-bs-target="#adminPanel">
                        <i className="bi bi-gear"></i> Administrar catálogo
                    </button>
                </div>

                {/* Panel desplegable para agregar videojuegos */}
                <div className="collapse mb-4" id="adminPanel">
                    <div className="panel-form p-4">
                        <h3 className="h6 mb-3">Agregar un videojuego</h3>
                        <FormularioAgregarJuego onAgregar={agregarJuego} />
                    </div>
                </div>

                <ListaVideojuegos
                    productos={productosFiltrados}
                    cargando={cargando}
                    error={error}
                    estaEnCarrito={estaEnCarrito}
                    onToggleCarrito={alternarCarrito}
                    onEliminarJuego={eliminarJuego}
                />
            </main>

            <FormularioContacto />

            <Carrito
                carrito={carrito}
                onCambiarCantidad={cambiarCantidad}
                onQuitar={quitarDelCarrito}
                onVaciar={vaciarCarrito}
                totalPrecio={totalPrecio}
            />

            <PieDePagina />
        </React.Fragment>
    );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
