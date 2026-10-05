const { useState, useEffect } = React;

function formatearPrecio(valor) {
    return valor.toLocaleString("es-CL", {
        style: "currency", currency: "CLP", minimumFractionDigits: 0
    });
}

function App() {
    // useState: catalogo, carrito, estados de carga, filtro y busqueda
    const [productos, setProductos] = useState([]);
    const [carrito, setCarrito] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [categoria, setCategoria] = useState("todos");
    const [busqueda, setBusqueda] = useState("");

    // useEffect: carga los productos desde el JSON al iniciar
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

    // Filtra por categoria y por el texto del buscador
    const productosFiltrados = productos.filter((p) => {
        const coincideCategoria = categoria === "todos" || p.categoria === categoria;
        const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
        return coincideCategoria && coincideBusqueda;
    });

    const estaEnCarrito = (id) => carrito.some((item) => item.id === id);
    const totalUnidades = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    const totalPrecio = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

    // Agrega el producto o lo quita si ya estaba (toggle del boton)
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

    const categorias = [
        { valor: "todos", texto: "Inicio" },
        { valor: "Acción", texto: "Acción" },
        { valor: "RPG", texto: "RPG" },
        { valor: "Aventura", texto: "Aventura" }
    ];

    return (
        <React.Fragment>
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
                                        href="#"
                                        onClick={(e) => { e.preventDefault(); setCategoria(cat.valor); }}
                                    >
                                        {cat.texto}
                                    </a>
                                </li>
                            ))}
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

            <header className="hero text-center text-white py-5">
                <div className="container">
                    <h1 className="display-4 fw-bold">TodoJuegos</h1>
                    <p className="lead mx-auto" style={{ maxWidth: "700px" }}>
                        Tienda de videojuegos contemporáneos donde puedes encontrar todo
                        lo que necesitas para disfrutar al máximo.
                    </p>
                </div>
            </header>

            <main className="container my-5" id="productos">
                <h2 className="mb-4 titulo-seccion">Productos destacados</h2>

                {/* Renderizado condicional: carga, error o sin resultados */}
                {cargando && <div className="alert alert-info">Cargando productos...</div>}
                {error && !cargando && <div className="alert alert-danger">{error}</div>}
                {!cargando && !error && productosFiltrados.length === 0 && (
                    <div className="alert alert-warning">No se encontraron juegos con esos criterios.</div>
                )}

                <div className="row g-4">
                    {!cargando && !error && productosFiltrados.map((producto) => (
                        <div className="col-12 col-sm-6 col-lg-4" key={producto.id}>
                            <article className="card card-producto h-100">
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
                                        {/* El boton cambia segun si el producto ya esta en el carrito */}
                                        <button
                                            className={estaEnCarrito(producto.id) ? "btn btn-success btn-sm" : "btn btn-agregar btn-sm"}
                                            onClick={() => alternarCarrito(producto)}
                                        >
                                            {estaEnCarrito(producto.id)
                                                ? <span><i className="bi bi-check2"></i> En el carrito</span>
                                                : <span><i className="bi bi-cart-plus"></i> Agregar</span>}
                                        </button>
                                    </div>
                                </div>
                            </article>
                        </div>
                    ))}
                </div>
            </main>

            {/* Carrito (offcanvas de Bootstrap) */}
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
                                        <button className="btn btn-sm btn-outline-light py-0" onClick={() => cambiarCantidad(item.id, -1)}>-</button>
                                        <span>{item.cantidad}</span>
                                        <button className="btn btn-sm btn-outline-light py-0" onClick={() => cambiarCantidad(item.id, 1)}>+</button>
                                        <button className="btn btn-sm btn-quitar" onClick={() => quitarDelCarrito(item.id)}>
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
                        <button className="btn btn-comprar w-100" onClick={vaciarCarrito}>
                            Vaciar carrito
                        </button>
                    </div>
                </div>
            </div>

            <footer id="contacto" className="text-center py-4 mt-5">
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
        </React.Fragment>
    );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
