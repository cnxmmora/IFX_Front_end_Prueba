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
- Registro de administrador: al seleccionar el rol "Administrador" se debe ingresar la clave `AdminKey123` en el campo `adminKey`.

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

## Troubleshooting

### Error 401 en autenticacion / CORS y cookies

Si ves error 401 al intentar autenticarte en produccion en Render, el problema suele ser CORS + cookies en cross-origin.

**Sintomas:**
- Login/registro funcionan pero luego /api/auth/me devuelve 401.
- Las cookies no viajan entre dominios.

**Causas comunes:**
1. Front y backend en dominios diferentes (e.g. ifx-front-end-prueba.onrender.com vs ifx-brack-end-prueba.onrender.com).
2. Backend sin NODE_ENV=production (la cookie sale SameSite=Lax en desarrollo, no viaja en cross-site).
3. Backend sin CORS_ORIGINS configurado.
4. Frontend no mandando credenciales (cookies) en requests.

**Solucion (Backend):**

Configura en Render las variables de entorno del backend:

```
NODE_ENV=production
CORS_ORIGINS=https://ifx-front-end-prueba.onrender.com
```

**Verificacion (Frontend):**

El frontend ya esta configurado correctamente con `credentials: 'include'` en todas las llamadas HTTP.

Verifica en DevTools (Application → Cookies):
1. Despues de login, debe haber cookie `access_token` (o similar) con dominio `.onrender.com`.
2. Cookie debe tener `SameSite=None` y `Secure=true` (en produccion).
3. Si no aparece, el backend no esta seteando Set-Cookie.

**Debug:**

En navegador, ejecuta en console tras login:

```javascript
// Verifica si la cookie viaja
fetch('https://ifx-brack-end-prueba.onrender.com/api/auth/me', {
  credentials: 'include'
}).then(r => r.json()).then(console.log);
```

Si devuelve 401, el backend necesita reconfiguración de CORS.


## Bitacora de IA

Para el Front, tome una plantilla de Dashboard que ya habia trabajado y le cambie los estilos y el flujo, con ello le pedi que me ayudara a revisar y cambiar el tema de los estilos, luego le pase el back que ya tenia, sobre la estructura que estaba manejando, y le pase las APIS con los payload que tenia que usar, para que reemplazara las que ya tenia, con eso pudo crear las conecciones nesesarias para el proyecto y yo tome partido a conectar cada cada una, ya en mi experiencia me tome a intalar todas las dependecias que nesecitaba y empece a testear en local las conecciones

Promt usados
"La ruta del login no esta conectando, dice que tiene problemas de autenticaciones"
"Analiza las variables de entorno mira si estan conectando con el servidor local"
"Tengo un problema con el envio del mensaje a twilio, separa el geocodificador solo para enviar el numero, en backend se encargara de poner el +57 del telefono"
"Te voy a pasar unos requerimientos de proyecto, dime que carpetas hacen falta para separa los archivos para craer un diseño atomico sobre el proyecto"
"separa los servicios en un archivo a parte"
"tengo el endpoint de produccion para el back, añadelo a las variables globales"
"revisa la estrcutura del projecto, no m esta compilando el DIST para deployar"



