# TodoJuegos

Tienda de videojuegos (eCommerce) desarrollada con **HTML5 semántico, CSS, Bootstrap 5 y React**.
El catálogo se carga dinámicamente, permite filtrar por categoría, agregar/eliminar juegos,
gestionar un carrito de compras y enviar un formulario de contacto con validación.

## Demo en vivo

👉 https://benyaminyamal.github.io/VIDEOGAME-PROYECT-HTML/

## Características

- **HTML semántico**: uso de `<header>`, `<nav>`, `<main>`, `<section>` y `<footer>`.
- **Bootstrap 5** para la maquetación responsiva (navbar, tarjetas, grid y offcanvas).
- **Flexbox y CSS Grid** (sistema de rejilla `row/col` y utilidades `d-flex`).
- **Catálogo dinámico**: los videojuegos se cargan desde `productos.json` con `fetch`.
- **Filtro por categoría** y buscador por nombre.
- **Carrito de compras**: agregar, eliminar y cambiar cantidades, con total en tiempo real.
- **Administrar catálogo**: panel para agregar nuevos juegos y botón para eliminarlos.
- **Formulario de contacto** con validación de campos (nombre, correo y mensaje).
- **React** organizado en componentes conectados mediante `props` y `state`.

## Tecnologías

- HTML5, CSS3
- Bootstrap 5 + Bootstrap Icons
- React 18 (vía CDN) con Babel Standalone
- JavaScript (ES6+)

## Estructura del proyecto

```
videojuego-proyect/
├── index.html          # Página principal (monta la app de React)
├── inicio.html         # Página de bienvenida
├── productos.json      # Datos de los videojuegos
└── assets/
    ├── css/
    │   └── estilos.css # Estilos propios (tema oscuro/morado)
    ├── js/
    │   └── app.js      # Componentes de React y lógica de la aplicación
    └── img/            # Imágenes de las portadas
```

## Componentes de React

- **Navbar** – barra de navegación con categorías, buscador y acceso al carrito.
- **Hero** – cabecera con el nombre y la descripción de la tienda.
- **ListaVideojuegos / TarjetaVideojuego** – renderizan el catálogo dinámicamente.
- **FormularioAgregarJuego** – agrega nuevos juegos al estado del catálogo.
- **Carrito** – panel lateral con los productos seleccionados.
- **FormularioContacto** – formulario con validación de datos.
- **PieDePagina** – información de contacto y redes sociales.

## Cómo ejecutarlo localmente

Como el proyecto usa `fetch` y React con Babel, debe servirse mediante un servidor local
(no abriendo el archivo directamente con doble clic).

1. Clona el repositorio:
   ```bash
   git clone https://github.com/benyaminyamal/VIDEOGAME-PROYECT-HTML.git
   ```
2. Entra a la carpeta del proyecto:
   ```bash
   cd VIDEOGAME-PROYECT-HTML/videojuego-proyect
   ```
3. Levanta un servidor local (por ejemplo con Python):
   ```bash
   python3 -m http.server 8000
   ```
4. Abre en tu navegador:
   ```
   http://localhost:8000/index.html
   ```

## Autor

Benjamín Claros
