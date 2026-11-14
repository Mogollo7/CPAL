---
tags: [capl, especificacion, stack]
---

# E01 · Stack y entorno

Volver a [[E00-Especificacion-Inicio]]. Concreta [[05-Arquitectura]].

## Piezas

| Para | Se usa | Nota |
|------|--------|------|
| Lenguaje | TypeScript, modo estricto | Un solo lenguaje en todo el proyecto |
| Entorno | Node.js, versión LTS vigente | Se fija en `.nvmrc` y en la imagen Docker |
| Gestor de paquetes | npm | El que ya viene con Node |
| Aplicación | Next.js (App Router) | Sitio, panel y servidor en un solo proyecto |
| Estilos | Tailwind CSS, configurado **solo** con los tokens de [[N10-Tokens-y-Figma]] | Se desactiva la paleta y la escala por defecto |
| Base de datos | PostgreSQL | Con la extensión `btree_gist` (ver [[E02-Modelo-de-Datos]]) |
| Acceso a datos | Prisma | Esquema + migraciones |
| Sesiones | Auth.js, proveedor de credenciales, sesión en cookie firmada | |
| Contraseñas | argon2id | |
| Validación | Zod | Mismos esquemas en navegador y servidor |
| Correo | Resend + plantillas en React Email | |
| Imágenes subidas | sharp | Recorte y reducción de fotos |
| Festivos | Librería de festivos de Colombia | Verificar al instalar que cubre el año en curso y el siguiente |
| Pruebas | Vitest (lógica) + Playwright (una prueba de extremo a extremo) | |
| Calidad | ESLint + Prettier | Automáticos al guardar y en CI |
| Despliegue | Node.js local directo (primera fase) ➔ Docker optimizado (fase final) | [[E07-Infraestructura]]. Desarrollo ágil sin Docker para evitar imágenes pesadas |
| CI | GitHub Actions | |

**Versiones:** al crear el proyecto se toma la última estable de cada una y queda fijada en `package-lock.json`. No se actualizan versiones mayores durante el desarrollo.

**No se instala** (decisión, no olvido): gestor de estado global, librería de componentes, librería de formularios, librería de fechas pesada, ORM alternativo, cola de mensajes, caché externa. El formulario por pasos usa estado de React y `sessionStorage`; las fechas usan `Intl` con zona `America/Bogota`.

## Estructura de carpetas

```
/
├─ app/
│  ├─ (publico)/                 [A]
│  │  ├─ page.tsx                       inicio
│  │  ├─ como-funciona/
│  │  ├─ servicios/
│  │  ├─ equipo/
│  │  ├─ eventos/  └─ [slug]/
│  │  ├─ ayuda-inmediata/
│  │  ├─ preguntas-frecuentes/
│  │  ├─ contacto/
│  │  ├─ pedir-cita/  └─ confirmacion/
│  │  ├─ cita/[token]/
│  │  ├─ privacidad/   terminos/   sin-conexion/
│  │  └─ layout.tsx                     encabezado, pie, botón de ayuda
│  ├─ (acceso)/                  [A pantalla · B lógica]
│  │  ├─ ingresar/   crear-clave/[token]/   recuperar-clave/
│  ├─ (panel)/panel/             [C]
│  │  ├─ layout.tsx                     guarda de sesión y rol
│  │  ├─ psicologo/  citas/ perfil/ horario/ cuenta/
│  │  └─ admin/      citas/ psicologos/ eventos/ bloqueos/ configuracion/ ...
│  └─ api/                       [B]
│     ├─ auth/[...nextauth]/
│     ├─ cupos/            GET
│     ├─ tareas/           POST  (tarea programada)
│     ├─ salud/            GET
│     └─ admin/exportar/   GET   (CSV)
├─ componentes/
│  ├─ ui/                        [A]   piezas del sistema de diseño
│  └─ panel/                     [C]   piezas propias del panel
├─ contenido/                    [A]
│  ├─ emergencias.json   servicios.json   faq.json   legal/
│  └─ ilustraciones/
├─ contratos/                    [B]   esquemas Zod + tipos compartidos
├─ servidor/                     [B]
│  ├─ cupos/   citas/   cuentas/   eventos/   correo/   tareas/
│  ├─ permisos.ts   fechas.ts   resultado.ts   limites.ts   auditoria.ts
│  └─ bd.ts
├─ correos/                      [B código · A diseño]
├─ prisma/                       [B]   schema.prisma, migrations/, semilla.ts
├─ estilos/tokens.css            [A]   variables generadas desde Figma
├─ pruebas/                      [B]   extremo a extremo
├─ infra/                        [C]   compose, Caddyfile, respaldo
├─ public/                       manifest, service worker, iconos
└─ cerebro/                      esta bóveda
```

Las pruebas unitarias viven junto al archivo que prueban (`cupos.ts` → `cupos.test.ts`).

## Variables de entorno

Todas se listan en `.env.example` **sin valores**. Ninguna entra al repositorio.

| Variable | Para qué | Ejemplo de forma |
|----------|----------|------------------|
| `DATABASE_URL` | Conexión de la **aplicación** a PostgreSQL, con el usuario `capl_app` (solo datos) | `postgresql://capl_app:clave@db:5432/capl` |
| `DATABASE_URL_MIGRADOR` | Solo para `bd:migrar`: usuario `capl_migrador` (crea y altera tablas). Si falta, se usa `DATABASE_URL` | `postgresql://capl_migrador:clave@db:5432/capl` |
| `AUTH_SECRET` | Firma de sesiones y de enlaces de cita | cadena aleatoria de 32 bytes |
| `URL_SITIO` | Dirección pública; con ella se arman los enlaces de los correos | `https://pruebas.dominio` |
| `RESEND_API_KEYS` | Envío de correo. Soporta una o varias llaves separadas por coma para rotación automática si se agota la cuota | `re_123,re_456` |
| `CORREO_REMITENTE` | Quién envía | `CAPL <citas@dominio>` |
| `CORREO_RESPUESTA` | A dónde llegan las respuestas | correo del CAPL |
| `CORREO_REDIRIGIR_A` | **Solo pruebas:** todo correo se desvía a esta dirección | correo del equipo |
| `CORREO_MODO` | `consola` (local) · `resend` (pruebas y producción) | — |
| `CRON_SECRET` | Autoriza la llamada de la tarea programada | cadena aleatoria |
| `RUTA_ARCHIVOS` | Carpeta de fotos e imágenes subidas | `/datos/archivos` |
| `ADMIN_INICIAL_CORREO` | Primer administrador que crea la semilla | — |
| `ENTORNO` | `local` · `pruebas` · `produccion` | — |
| `CLAVE_CIFRADO` | Cifra el motivo de consulta; lleva número de versión | 32 bytes aleatorios |
| `RESEND_WEBHOOK_SECRET` | Verifica los avisos de entrega de Resend | — |
| `GMAIL_USUARIO` · `GMAIL_CLAVE_APP` | Respaldo de envío. Vacío = sin respaldo | cuenta dedicada |
| `GOOGLE_CALENDAR_ID` · `GOOGLE_CREDENCIALES` | Calendario compartido. Vacío = integración apagada | — |
| `MEDICION` | `si` · `no`: medición de uso anónima | — |

Reglas: `URL_SITIO` es la **única** fuente de la dirección del sitio (RES-TEC-05). En `pruebas`, si `CORREO_REDIRIGIR_A` está vacío, **no se envía nada**.

## Comandos del proyecto

Estos nombres se usan igual en local y en CI.

| Comando | Hace |
|---------|------|
| `npm run dev` | Levanta la aplicación en local |
| `npm run bd:subir` | Levanta PostgreSQL local con Docker |
| `npm run bd:migrar` | Aplica migraciones |
| `npm run bd:semilla` | Carga datos de ejemplo |
| `npm run bd:reiniciar` | Borra, migra y siembra (solo local) |
| `npm run lint` | ESLint + Prettier en modo comprobación |
| `npm run tipos` | Comprobación de tipos |
| `npm run pruebas` | Vitest |
| `npm run pruebas:e2e` | Playwright |
| `npm run build` | Compilación de producción |
| `npm run correos` | Vista previa de las plantillas de correo |

## Primer día (tarea T-002)

1. Crear el proyecto Next.js con TypeScript, App Router, Tailwind y ESLint.
2. Activar el modo estricto de TypeScript y añadir Prettier.
3. Crear las carpetas vacías de la estructura con un `README` de una línea en cada una que diga su dueño.
4. Añadir `.nvmrc`, `.env.example`, `.gitignore` (incluye `.env*` salvo el ejemplo).
5. Página de inicio provisional "Hola CAPL" y ruta `/api/salud` que responde `ok`.
6. Definir los comandos de la tabla anterior, aunque algunos aún no hagan nada.
7. Primer PR → CI en verde → despliegue automático a pruebas.

**Levantar el proyecto en limpio debe tomar menos de 10 minutos** (RNF-MAN-02): clonar, copiar `.env.example`, `npm install`, `bd:subir`, `bd:migrar`, `bd:semilla`, `dev`.
