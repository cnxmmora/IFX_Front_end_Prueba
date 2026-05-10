# TestFX Front End

Frontend web de TestFX para autenticacion segura y gestion de maquinas virtuales (VMs) en tiempo real.

La aplicacion esta construida con React + Vite + TanStack Router + TanStack Query y consume un backend HTTP + Socket.IO.

## Para que sirve esta app

Permite a un usuario autenticado:

1. Iniciar sesion o registrarse (con verificacion SMS).
2. Ver dashboard operativo con metricas de VMs.
3. Consultar listado de VMs con filtros y busqueda.
4. Crear, editar o eliminar VMs si el rol es Administrador.
5. Consultar su perfil y estado de sesion.

Tambien incluye contratos API para ordenes y suscripciones del portal comercial, aunque el flujo visual de checkout aun no esta implementado en esta version del frontend.

## Tecnologias utilizadas

Base del proyecto

- React 19
- TypeScript
- Vite 7

Routing y manejo de datos

- TanStack Router
- TanStack Query

UI y estilos

- Tailwind CSS v4
- Lucide React (iconografia)
- Sonner (notificaciones toast)
- Recharts (graficas en dashboard)

Formularios y validacion

- React Hook Form
- Zod
- @hookform/resolvers

Tiempo real y red

- Socket.IO Client
- Fetch API con credenciales via cookie HttpOnly

Tooling

- ESLint
- Prettier
- Bun (opcional para instalacion/ejecucion)

## Rutas principales

- /login: autenticacion y registro (incluye SMS).
- /portal: dashboard principal (requiere sesion).
- /reports: listado de VMs (requiere sesion).
- /report/new: alta de VM (solo Administrador).
- /report/:id: edicion de VM (solo Administrador).
- /profile: perfil y seguridad del usuario.
- /checkout: ruta reservada para compra; actualmente redirige a /login.

## Flujo funcional de la app

1. Entrada
- La ruta / redirige a /portal.
- Si no hay sesion valida, las rutas privadas redirigen a /login.

2. Autenticacion
- Login: valida credenciales y crea sesion por cookie HttpOnly.
- Registro: crea usuario y solicita validacion por codigo SMS antes de continuar.

3. Operacion de VMs
- En /portal se muestran metricas y actividad reciente.
- En /reports se listan VMs con busqueda, filtros por estado y actualizacion realtime.
- En /report/:id se edita (o crea) VM con validacion y actualizacion optimista.

4. Perfil
- En /profile se muestra informacion de cuenta, seguridad de sesion y estado actual.

## Flujo de cada venta

Nota: en este frontend, la parte de venta esta parcialmente preparada por API, pero no expuesta aun con UI completa.

Flujo 1: Venta nueva (suscripcion/orden)
1. El usuario autenticado inicia una compra desde el portal comercial (pendiente de UI en este repo).
2. El backend registra la orden en /api/portal/orders.
3. El sistema crea o activa la suscripcion asociada en /api/portal/subscriptions.
4. El frontend puede consultar la orden y su estado (pending, completed, cancelled, refunded).

Flujo 2: Consulta de venta
1. El usuario autenticado solicita su historial.
2. El frontend usa ordersApi.list() para listar ordenes.
3. Puede consultar detalle con ordersApi.getById(id).

Flujo 3: Post-venta (suscripcion)
1. El usuario consulta suscripciones con subscriptionsApi.list().
2. Si necesita detener renovacion, ejecuta subscriptionsApi.cancel(id).
3. El estado pasa por active, cancelled o expired segun respuesta del backend.

## Variables de entorno

Configura al menos:

- VITE_API_URL: URL base del backend.

Comportamiento por defecto del frontend si no defines VITE_API_URL:

- En local: http://localhost:4000
- En produccion: https://ifx-brack-end-prueba.onrender.com

Ejemplo:

```env
VITE_API_URL=http://localhost:4000
```

Ejemplo para produccion:

```env
VITE_API_URL=https://ifx-brack-end-prueba.onrender.com
```

## Instalacion y ejecucion

Con npm:

```bash
npm install
npm run dev
```

Con bun:

```bash
bun install
bun run dev
```

Build de produccion:

```bash
npm run build
```

## Estructura resumida

```text
src/
  routes/          # Pantallas y guardas de acceso
  components/      # UI reutilizable y layout
  lib/api.ts       # Cliente HTTP tipado + contratos
  lib/session.ts   # Query options de sesion y VMs
  components/vm/   # Integracion realtime con Socket.IO
```

## Estado actual

- Implementado: autenticacion, perfil, dashboard, CRUD de VMs, realtime.
- Parcial: modulo comercial (ordenes/suscripciones disponible por API).
- Pendiente: UI completa de checkout y pantallas comerciales de compra.
