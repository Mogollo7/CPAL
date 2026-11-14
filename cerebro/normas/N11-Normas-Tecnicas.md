---
tags: [capl, normas, codigo]
---

# N11 · Normas técnicas

Volver a [[N00-Normas-Inicio]]. Convenciones para cuando empiece la construcción. Complementa [[05-Arquitectura]] (qué se usa) y [[07-Protocolo-de-Equipo]] (cómo se colabora); aquí va **cómo se escribe**.

> Solo definición. Nada de esto se ha construido.

## Principio

**Lo mínimo que funcione, escrito para que otro lo entienda.** El sistema quedará casi sin mantenimiento (D-07): cada dependencia y cada abstracción de más es algo que nadie va a cuidar.

1. Antes de escribir algo: ¿ya existe en el proyecto, en el lenguaje o en el navegador? Se reutiliza.
2. No se añade una dependencia para lo que resuelven diez líneas.
3. No se construye "por si acaso".
4. Se prefiere una restricción en la base de datos a una validación solo en código.

## Nombres

| Qué | Convención | Ejemplo |
|-----|-----------|---------|
| Archivos y carpetas | minúsculas con guion | `tarjeta-servicio.tsx` |
| Componentes | PascalCase | `TarjetaServicio` |
| Funciones y variables | camelCase, verbo primero | `calcularCupos` |
| Tipos | PascalCase | `Cita`, `EstadoCita` |
| Constantes y valores de enumeración | MAYÚSCULAS | `PENDIENTE` |
| Tablas y columnas | Las que genere el esquema; nombres en singular | `Cita.inicio` |
| Rutas públicas | Español, minúsculas, guion | `/pedir-cita`, `/ayuda-inmediata` |
| Variables de entorno | MAYÚSCULAS con guion bajo | `RESEND_API_KEY` |
| Tokens | Ver [[N10-Tokens-y-Figma]] | `accion-fondo` |

**Idioma:** el dominio se nombra en **español** (`Cita`, `Psicologo`, `autorizarCita`), igual que en los requisitos, para que código y cerebro hablen igual. Sin tildes ni ñ en identificadores. Los términos técnicos quedan en inglés (`id`, `token`, `hash`).

## Código

- TypeScript en modo estricto; sin `any` salvo justificado en un comentario.
- Formato y lint automáticos; no se discuten estilos en los PR.
- Funciones cortas, con un solo propósito. La lógica de negocio (cupos, estados, permisos) vive en `servidor/` como funciones puras, sin interfaz ni red, para poder probarla.
- Comentarios solo para explicar **por qué**, no qué. Un atajo consciente se marca: `// atajo: … mejorar cuando …`.
- Sin código muerto ni comentado en `main`.
- Textos visibles fuera de los componentes cuando se repiten; mensajes de error en un solo archivo.

## Estilos

- **Solo tokens.** Ningún color hexadecimal, tamaño en px ni duración escritos en un componente. Un PR con valores sueltos se devuelve.
- Tamaños de texto en `rem`; espacios con tokens; anchos en `%`, `ch` o máximos.
- Móvil primero: los estilos base son los de 320–360 px.
- Las reglas anti-desborde de [[N03-Tipografia-y-Escala-Aurea]] son obligatorias.
- Sin `!important`. Sin estilos en línea salvo valores calculados.
- El anillo de foco no se quita nunca.

## Componentes

- Uno por archivo, en `componentes/ui/` si es reutilizable.
- Se usa **el elemento nativo correcto** antes que uno fabricado: `<button>` para acciones, `<a>` para ir a otro lugar, `<label>` para etiquetas, `<dialog>` para modales.
- Todo componente interactivo acepta y muestra sus estados ([[N06-Componentes-y-Estados]]).
- No se crea un componente nuevo si una variante de uno existente sirve.

## Formularios y datos

- **Un solo esquema** por formulario en `contratos/`, usado en el navegador y en el servidor.
- El servidor **siempre** valida, aunque el navegador ya lo haya hecho.
- Fechas: se guardan en UTC, se muestran en `America/Bogota`, se formatean en un único módulo.
- Nunca se confía en un identificador que llega del navegador sin comprobar permisos.
- Los datos personales no se escriben en registros, mensajes de error ni direcciones web.

## Errores

- El usuario ve un mensaje humano ([[N08-Lenguaje-y-Tono]]); el detalle técnico va al registro del servidor.
- Un fallo de correo no rompe la operación: la cita se guarda y el envío se reintenta.
- Toda pantalla tiene estado de error con una acción ("Intentar de nuevo") y los contactos del CAPL.
- Los errores no se silencian.

## Imágenes y recursos

| Recurso | Norma |
|---------|-------|
| **Formato estándar WebP** | **Toda imagen que se visualiza debe ser WebP (`.webp`)**, nunca PNG ni JPG pesados. Carga hasta un 80% más rápido |
| **Convertidor automático** | Al subir fotos (perfil o eventos), el backend procesa con `sharp` y convierte automáticamente a `.webp` optimizado antes de guardar |
| **Límite de subida** | Máximo **6 MB** para fotos de perfil (triplicado); máximo **9 MB** para eventos. **Mensaje obligatorio en la interfaz** indicando el límite ("Tamaño máximo: 6 MB. Formatos: JPG, PNG, WebP"). Validación estricta de tipo MIME y cabecera real (*magic bytes*) |
| Ilustraciones | SVG vectorial optimizado ([[N05-Ilustracion]]) |
| Fotos de perfil | Se recortan a cuadrado y se reducen al subirlas; máx. 400 × 400 px, WebP |
| Fuentes | En el propio servidor, formato WOFF2, solo los pesos 400, 600 y 800 |
| Iconos | Una sola familia, como SVG |

## Protocolo de carga perezosa (Lazy loading con IntersectionObserver)

Para garantizar un rendimiento sobresaliente y cumplir el presupuesto de < 2,5 s en móvil:

1. **Imágenes diferidas:** Toda imagen que esté fuera de la primera pantalla visible (*below the fold*) usa carga perezosa nativa (`loading="lazy"`) y un observador `IntersectionObserver`.
2. **Componentes y bloques pesados:** Secciones secundarias (cartelera de eventos, mapas, acordeones de preguntas frecuentes) se hidratan o cargan bajo demanda únicamente cuando el usuario se desplaza cerca de ellas (`rootMargin: "200px"`).
3. **Imágenes prioritarias (*above the fold*):** La imagen de portada de la casa amarilla se marca con `priority` en Next.js para evitar saltos de diseño (*layout shift*).

## Seguridad técnica en el código

- **Cero input a Shell (prohibición total):** Está **estrictamente prohibido** pasar entradas del usuario o variables concatenadas a comandos de terminal o intérpretes de shell (`child_process.exec`, `sh`, `bash`). Toda operación debe realizarse con APIs nativas de Node.js o librerías auditadas, eliminando cualquier vector de *Shell Injection*.
- **Firma obligatoria en Webhooks:** Todo endpoint que reciba eventos externos (como `POST /api/webhooks/resend`) debe validar obligatoriamente la firma criptográfica (HMAC-SHA256) en las cabeceras. Peticiones sin firma o con firma inválida se rechazan con HTTP 401.
- **Cero dependencias y algoritmos obsoletos:**
  - Prohibido el uso de algoritmos criptográficos débiles u obsoletos (MD5, SHA-1, DES, RC4 o llaves cortas).
  - Algoritmos estándar autorizados: `argon2id` para contraseñas, `HMAC-SHA256` para firmas de webhooks y tokens, `AES-256-GCM` para datos en reposo.
  - Dependencias mínimas y auditadas con `npm audit` estricto en el pipeline de CI.
- Secretos solo por variables de entorno; `.env` nunca entra al repositorio.
- Consultas a la base de datos siempre parametrizadas (las del ORM Prisma).
- Salida siempre escapada contra ataques XSS; nada de contenido del usuario insertado como HTML crudo.
- Los tokens (invitación, cancelación, 2FA) se guardan siempre como hash criptográfico, nunca en texto plano.

## Antes de pedir revisión

- [ ] Hace lo que dice el requisito, y solo eso
- [ ] Sin valores sueltos de estilo; solo tokens
- [ ] Sin dependencias nuevas, o están justificadas en el PR
- [ ] Probado a 320 px, con teclado y con zoom al 200 %
- [ ] La lógica nueva tiene su prueba
- [ ] Sin datos personales ni secretos en el código o en los registros
