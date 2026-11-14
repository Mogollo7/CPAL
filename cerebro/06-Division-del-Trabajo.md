---
tags: [capl, equipo]
---

# 06 · División del trabajo

Volver a [[00-Inicio]].

## Equipo oficial y asignación de roles

| Integrante | Rol en el proyecto | Dificultad | Carga | Carpetas que posee | Rama de trabajo |
|---|---|:---:|:---:|---|---|
| **Sebas** (Tú) | **Líder Técnico & Diseño Total:**<br>Arquitectura, base de datos, motor de cupos, 2FA admin, Resend con rotación, infraestructura, monitoreo y **Diseño UI/UX completo en Figma**. | **8.8 / 10**<br>*(La más difícil de todas)* | **55 %** | `estilos/`, `contratos/`, `prisma/`, `servidor/`, `app/api/`, `correos/`, `infra/`, `.github/` | `dev/sebas` |
| **Brand** | **Frontend Paneles & Gestión:**<br>Bandeja de citas de administración, acciones de autorizar/rechazar con modal, pantalla de login + modal 2FA, horario del psicólogo y creación de eventos. | **6.0 / 10**<br>*(La más difícil entre los dos)* | **25 %** | `app/(panel)/`, `componentes/panel/` | `dev/brand` |
| **César** | **Frontend Sitio Público & Emergencias:**<br>Páginas públicas (Inicio, Servicios, Cómo funciona, Contacto), Guía de emergencias completa (`/ayuda-inmediata`), formulario de citas y cartelera de eventos. | **5.8 / 10**<br>*(La más fácil y directa)* | **20 %** | `app/(publico)/`, `componentes/ui/`, `contenido/` | `dev/cesar` |

---

## Detalle por integrante: tareas, stack, qué puede adelantar y dependencias

### 👑 1. SEBAS — Arquitectura, Diseño Total y Lógica Compleja (8.8 / 10)
* **Stack:** Figma, TypeScript, Next.js (App Router), Prisma, PostgreSQL, Auth.js, Resend API, Zod, Caddy.
* **Archivo oficial en Figma:** [https://www.figma.com/design/uTlCaNxTW25BblEcKFOOUF/psicologia?node-id=0-1](https://www.figma.com/design/uTlCaNxTW25BblEcKFOOUF/psicologia?node-id=0-1)
* **Misión:** Diseñar todo el sistema visual en Figma y construir el núcleo backend más exigente.
* **Lo que puede adelantar DE INMEDIATO (sin esperar a nadie):**
  1. Diseñar en Figma las pantallas base (Retícula 12/8/4, Escala 32/20/16/13, colores CAPL, Inicio, Emergencias y Paneles).
  2. Escribir los contratos TypeScript y esquemas Zod en `contratos/cita.ts`, `contratos/horario.ts`, etc. (esto desbloquea a Brand y César).
  3. Crear el modelo de base de datos en `prisma/schema.prisma` y la lógica de autenticación con Auth.js.
  4. Desarrollar el adaptador de Resend con rotación automática de API keys y generación de `.ics`.
* **Riesgo:** Eres el camino crítico. Si demoras los contratos, Brand y César deben usar datos simulados (*mocks*).

---

### 👤 2. BRAND — Frontend Paneles, Autenticación y Citas (6.0 / 10)
* **Stack:** Next.js (React Server & Client Components), Tailwind CSS, Lucide Icons, Zod (consumo).
* **Misión:** Construir la interfaz donde operan las monitoras, coordinadores y psicólogos.
* **Lo que puede adelantar DE INMEDIATO (sin riesgo de adelantarse a nadie):**
  1. Estructura de layout del panel en `app/(panel)/layout.tsx` (barra lateral fija de 260px, cabecera de usuario, navegación).
  2. Maquetar la **Bandeja de Citas** (`/panel/admin/citas`) con tabla interactiva, filtros por estado (Pendiente, Autorizada, Rechazada) usando datos simulados de prueba.
  3. Maquetar la pantalla de Login (`/ingresar`) y la pantalla del código 2FA de 6 dígitos con la casilla *"Recordar este dispositivo por 30 días"*.
  4. Maquetar la pantalla de horarios semanales del psicólogo (`/panel/psicologo/horario`).
* **De qué depende de Sebas:**
  * Depende de los esquemas en `contratos/` y los endpoints reales (`/api/citas/autorizar`, `/api/auth`) para conectar los botones a la base de datos real.

---

### 👤 3. CÉSAR — Frontend Sitio Público y Emergencias (5.8 / 10)
* **Stack:** Next.js, Tailwind CSS, Lucide Icons, JSON estático.
* **Misión:** Construir la cara pública de la plataforma, acogedora, accesible y rápida.
* **Lo que puede adelantar DE INMEDIATO (sin riesgo de adelantarse a nadie):**
  1. Maquetar la **Guía de Emergencias** (`/ayuda-inmediata`): Tarjetas por código de color (Dorado, Fucsia, Blanco, Rosa), directorio de teléfonos con botón táctil `tel:` y el ejercicio de anclaje 5-4-3-2-1. Lee directo de `contenido/emergencias.json` (100% independiente de la base de datos).
  2. Maquetar las páginas informativas: Inicio (`/`), Cómo funciona (`/como-funciona`), Servicios (`/servicios`), Contacto (`/contacto`).
  3. Maquetar los primeros pasos del Formulario de Cita (`/pedir-cita`): Selección de servicio y "¿Para quién es la cita?".
  4. Maquetar la cartelera pública de eventos (`/eventos`).
* **De qué depende de Sebas:**
  * Depende del endpoint `GET /api/cupos` para mostrar el calendario con horarios reales disponibles en el Paso 3 del formulario.

---

## Principio de aislamiento por carpetas

Cada persona es **dueña de carpetas completas**:
- **Sebas:** `servidor/`, `app/api/`, `prisma/`, `contratos/`, `correos/`, `infra/`, `estilos/`
- **Brand:** `app/(panel)/`, `componentes/panel/`
- **César:** `app/(publico)/`, `componentes/ui/`, `contenido/`

**Cero conflictos de Git:** Nadie edita archivos en las carpetas de otro. Lo único que se comparte son los tipos en `contratos/`, que Sebas mantiene y versiona.

### C — Paneles, eventos e infraestructura

| Qué | Detalle |
|-----|---------|
| Panel admin | Psicólogos, bandeja de citas, autorizar/rechazar, configuración, bloqueos |
| Panel psicólogo | Perfil, foto, horario semanal, mis citas |
| Eventos | Gestión completa desde el panel e inscritos |
| Infraestructura | Servidor, dominio, HTTPS, Docker, CI, copias de seguridad, monitoreo |
| Entornos | Mantiene pruebas (staging) y hace los despliegues |
| Entrega | Manual de administración y capacitación |
| Carpetas | `app/(panel)/`, `infra/`, `.github/` |
| Requisitos | RF-ADM-\*, RF-PSI-\*, RF-EVE-01/05, RNF-REN-\*, RNF-MAN-04/05 |

## Carga por fase

| Fase | A | B | C |
|------|---|---|---|
| 0 Preparación | Identidad y componentes base en Figma | Repositorio, esquema inicial | Servidor, dominio, staging, CI |
| 1 Sitio público | **Construye** el sitio y emergencias | Adelanta cuentas | Adelanta estructura del panel |
| 2 Cuentas y psicólogos | Diseña paneles y formulario | **Cuentas**, invitación | **Panel**: psicólogos, perfil, horario |
| 3 Citas | **Formulario** de cita | **Cupos, estados, correos** | **Bandeja** y autorización |
| 4 Eventos | Vista pública e inscripción | Inscripción y cupo | Gestión en el panel |
| 5 Pulido | Accesibilidad y contenido final | Seguridad y pruebas | Copias, monitoreo, rendimiento |
| 6 Lanzamiento | Revisión visual final | Migración a producción | Despliegue y manual |

Regla de RES-EQU-02: **el diseño de una fase se entrega al cierre de la fase anterior.**

## Puntos de contacto (donde hay que hablar antes de programar)

| Entre | Sobre | Cómo se acuerda |
|-------|-------|-----------------|
| A ↔ B | Qué datos pide y muestra el formulario de cita | Esquema en `contratos/cita.ts` |
| A ↔ B | Diseño y textos de los correos | Figma → `correos/` |
| A ↔ C | Diseño de los paneles | Figma con componentes de `componentes/ui/` |
| B ↔ C | Qué acciones ofrece la API al panel | `contratos/` + lista de rutas en el PR |
| Todos | Cambios al modelo de datos | Solo B edita `prisma/`; los demás lo piden por issue |

## Trabajar en paralelo sin esperar

- **A y C no esperan a B:** con el contrato acordado, programan contra datos de ejemplo que cumplen ese contrato. Cuando B termina, se cambia el origen de datos y nada más.
- **B no espera a A:** la lógica se prueba con pruebas automáticas, sin interfaz.
- **Nadie espera a C:** staging existe desde la fase 0.

## Revisión cruzada

| Autor del PR | Revisa |
|--------------|--------|
| A | C |
| B | A (flujo y textos) o C (técnico) |
| C | B |
