# ComeCix 🍗

E-commerce de comida rápida peruana (KFC, Popeyes, Pizza Hut) hecho con **React + Vite**,
consumiendo un backend simulado con **json-server**.

## Stack técnico

- **React + Vite** — interfaz y bundler.
- **React Router DOM** — navegación y rutas protegidas (`/cart`, `/checkout`).
- **Axios** — peticiones HTTP, con un interceptor centralizado que normaliza los errores de
  todas las llamadas (catálogo, login/registro, pedidos) para nunca dejar una pantalla en blanco.
- **Context API** (`AuthContext`, `CartContext`) — estado global de sesión y carrito, persistido
  en `localStorage`.
- **json-server** — simula el backend con tres archivos de datos independientes:
  - `db.json` → productos y carrusel (puerto 3000)
  - `users.json` → usuarios (puerto 3001)
  - `orders.json` → pedidos (puerto 3002)

## Instalación y ejecución

```bash
npm install
npm run dev
```

`npm run dev` levanta a la vez el frontend (Vite, `http://localhost:5173`) y los 3 servidores
de json-server. Si prefieres correrlos por separado:

```bash
npm run server   # solo el backend (productos, usuarios, pedidos)
npx vite         # solo el frontend
```

## Build de producción

```bash
npm run build
```

## Despliegue a GitHub Pages

```bash
npm run deploy
```

Esto compila el proyecto y publica `dist/` en la rama `gh-pages`. Nota: como el backend
(json-server) solo corre en tu máquina, el catálogo/carrito no cargarán datos para otros
visitantes de la URL pública a menos que también tengan `npm run server` corriendo localmente.

## Funcionalidades

- Catálogo con buscador y filtro por categoría (marca), carrusel de destacados.
- Detalle de producto.
- Registro (valida email duplicado) y login (con manejo de credenciales incorrectas).
- Sesión persistente en `localStorage`.
- Carrito: agregar, incrementar/disminuir cantidad, eliminar, vaciar.
- Rutas protegidas: `/cart` y `/checkout` solo accesibles con sesión iniciada.
- Checkout con dos métodos de pago: **Efectivo** (confirma directo) y **Yape** (QR + código de
  operación + captura de pantalla comprimida antes de enviarse).
