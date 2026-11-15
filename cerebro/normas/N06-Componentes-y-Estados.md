---
tags: [capl, normas, componentes]
---

# N06 · Componentes y estados

Volver a [[N00-Normas-Inicio]]. Lista de piezas a diseñar y las reglas de cada una. Todas viven en `componentes/ui/` y usan solo tokens de [[N10-Tokens-y-Figma]].

## Estados obligatorios

Todo componente interactivo se diseña en **todos** sus estados:

| Estado | Señal visual |
|--------|--------------|
| Normal | — |
| Cursor encima | Un tono más oscuro (600 → 700) |
| **Foco (teclado)** | Anillo de 3 px `morado-600` separado 3 px del borde. **Nunca se elimina** |
| Presionado | Se encoge al 98 % |
| Deshabilitado | 45 % de opacidad **y** texto que explica por qué |
| Cargando | Indicador circular suave dentro del componente; el texto cambia ("Enviando…") |
| Error | Borde `coral-700`, icono y mensaje debajo |
| Éxito | Borde `agua-700`, icono |

Toda pantalla se diseña además en: **con datos · vacía · cargando · con error · sin conexión.**

## Botones

| Tipo | Aspecto | Uso |
|------|---------|-----|
| Principal | Fondo `morado-600`, texto blanco, píldora | **Uno por pantalla** |
| Secundario | Fondo `morado-100`, texto `morado-700` | Acciones alternativas |
| Terciario | Solo texto `morado-700`, subrayado al pasar | "Volver", "Cancelar" |
| Ayuda | Fondo `amarillo-500`, texto `tinta`, icono de mano o corazón | Solo "Necesito ayuda ahora" |
| Delicado | Fondo `coral-100`, texto `coral-700` | Cancelar cita, desactivar psicólogo |

Reglas: alto mínimo 48 px · relleno horizontal `espacio-5` · peso 600 · texto en frase ("Pedir mi cita", no "PEDIR CITA") · verbo + objeto · puede ocupar dos líneas · en móvil el principal ocupa todo el ancho.

### Comportamiento cinético del Botón de Ayuda Flotante
- **Carga inicial (0–4s):** Aparece desplegado en píldora completa («Necesito ayuda ahora» + icono de auxilio/salvavidas) para garantizar visibilidad instantánea en situaciones de crisis.
- **Colapso automático (tras 4s):** Si no hay interacción tras 4000 ms, se contrae suavemente (`transition: 500ms ease-out`) a un botón circular de 68 px manteniendo el icono de rescate, liberando el viewport.
- **Hover y Foco:** Al pasar el cursor (`:hover`) o enfocar por teclado (`:focus-visible`), se re-expande de inmediato a la píldora completa con micro-elevación de sombra.
- **Accesibilidad y Neurobienestar:** Con `prefers-reduced-motion: reduce`, el cambio de ancho es instantáneo sin rebote ni animación continua. Mantiene `aria-label="Necesito ayuda ahora - Línea de emergencias psicológicas"`. Siempre enlaza directamente a `/ayuda-inmediata`.

## Campos de formulario

- Etiqueta **siempre visible arriba** del campo; el texto de ejemplo dentro no la reemplaza.
- Alto mínimo 48 px, `radio-m`, borde 1,5 px `borde`, fondo blanco.
- Ayuda debajo, en `tinta-suave`: para qué se pide el dato.
- Se marca **"(opcional)"** lo opcional; lo obligatorio no lleva asterisco rojo.
- El error aparece **al salir del campo**, no mientras se escribe, y dice cómo corregir.
- Tipo de teclado correcto en móvil (correo, teléfono, número).
- Fecha y hora: selector propio de cupos (abajo), no un calendario genérico.
- Un campo por fila en móvil.

## Formulario de cita (RF-CIT-01)

| Regla | Detalle |
|-------|---------|
| Pasos | Máximo 5; una decisión por paso |
| Progreso | Camino curvo con puntos; "Paso 2 de 5" en texto |
| Navegación | "Volver" siempre disponible y **conserva lo escrito** |
| Guardado | Si se recarga la página, no se pierde el avance |
| Elección de servicio | Tarjetas grandes con viñeta, nombre y una línea |
| Elección de psicólogo | Tarjetas con foto circular, nombre, área; primera opción "Cualquiera disponible" |
| Elección de horario | Días en fila deslizable; horas como píldoras. Lo no disponible **no se muestra** (no se muestra tachado) |
| Sin cupos | Mensaje amable + próxima fecha con cupos + contactos del CAPL |
| Resumen | Antes de enviar se muestra todo y se puede editar cada parte |
| Confirmación | Ilustración serena, qué sigue, cuándo responden, y las líneas de ayuda |
| Presencia de ayuda | En todos los pasos: "¿Es urgente? Encuentra ayuda inmediata" |

## Tarjetas

- Fondo blanco sobre crema, `radio-l`, relleno `espacio-5`, sin sombra.
- Toda la tarjeta es tocable si lleva a otro lugar; un solo destino por tarjeta.
- Orden interno: ilustración o foto → título → una o dos líneas → acción.

### Tarjeta de código de emergencia

Estructura en [[12-Codigos-de-Emergencia-Borrador]]. Reglas visuales: el color del código va en una **etiqueta píldora** y en el icono, no como fondo; los teléfonos son botones grandes de llamada; el texto es `texto-grande`.

## Avisos y mensajes

| Tipo | Fondo | Icono | Tono |
|------|-------|-------|------|
| Informativo | `morado-50` | círculo con "i" | Neutro |
| Aviso amable | `amarillo-100` | sol | "Ten en cuenta…" |
| Éxito | `agua-100` | visto bueno | "Listo" |
| Error | `coral-100` | círculo con raya | "No pudimos… Intenta…" |

Aparecen **dentro del flujo**, junto a lo que afectan. No hay ventanas emergentes ni avisos que desaparecen solos antes de 6 segundos. Los errores no desaparecen solos.

## Modales

Solo para confirmar acciones delicadas (cancelar cita, desactivar cuenta). `radio-xl`, fondo atenuado en `morado-900` al 40 %, se cierran con Escape y tocando fuera, el foco queda dentro, y la opción segura ("No, volver") es la destacada.

## Navegación

| Zona | Norma |
|------|-------|
| Encabezado público | Logo a la izquierda, máximo 5 enlaces, "Pedir cita" como botón principal |
| Móvil | Menú desplegable de pantalla completa; el botón de ayuda sigue visible |
| Pie | Único bloque oscuro (`morado-900`): contacto, redes, política de datos, líneas de ayuda |
| Panel | Barra lateral con iconos y texto; en móvil, barra inferior de máximo 4 destinos |
| Migas | Solo en el panel |

## Panel (admin y psicólogo)

Misma identidad, **más densidad y menos ilustración**: es una herramienta de trabajo.

- Tablas con filas de 48 px mínimo; en móvil se vuelven tarjetas.
- Estados de cita como píldoras de color + icono + texto ([[N02-Color]]).
- Acciones masivas arriba; acción por fila a la derecha.
- Toda acción irreversible pide confirmación; las demás se pueden deshacer.
- Estados vacíos con viñeta y una acción ("Aún no hay psicólogos. Crear el primero").

## Correos

- Una columna de 600 px máximo, fondo crema, tarjeta blanca `radio-l`.
- Una sola acción principal por correo.
- Encabezado con logo y casa amarilla; pie con contacto y líneas de ayuda.
- Deben leerse bien **sin imágenes** y en texto plano.
- No incluyen el motivo de consulta (RNF-PRI-05).

## Inventario para el primer mockup

Botón (5 tipos) · campo de texto · área de texto · selector · casilla · opción única · interruptor · píldora de estado · tarjeta de servicio · tarjeta de psicólogo · tarjeta de evento · tarjeta de código · selector de día · selector de hora · indicador de pasos · aviso (4 tipos) · modal · encabezado · pie · botón flotante de ayuda · tabla / lista del panel · estado vacío · plantilla de correo.
