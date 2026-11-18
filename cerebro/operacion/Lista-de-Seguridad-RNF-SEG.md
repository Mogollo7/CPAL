---
tags: [capl, operacion, seguridad]
---

# Lista de revisión de seguridad (T-504)

Volver a [[S01-Seguridad]]. Estado al **16-nov-2026**, sobre el código del repositorio. ✅ cumplido y con evidencia · 🟡 parcial · ⬜ pendiente. Se vuelve a pasar completa antes del lanzamiento y cada semestre ([[S08-Mantenimiento]]).

## RNF-SEG ([[03-Requisitos-No-Funcionales]])

| # | Requisito | Estado | Evidencia o lo que falta |
|---|-----------|--------|--------------------------|
| 01 | HTTPS en todo el sitio; HTTP redirige | ⬜ | La cabecera HSTS ya sale (`next.config.ts`, solo en producción). Falta el `Caddyfile` y el servidor (T-004, T-601); comprobar con `curl -I http://…` |
| 02 | Contraseñas con hash fuerte | ✅ | argon2id en `servidor/cuentas/clave.ts`, probado en `claves.test.ts`. Falta la inspección de la BD con datos reales |
| 03 | Rol comprobado en el servidor en cada ruta y acción | 🟡 | `servidor/permisos.ts` + `proxy.ts`, con `permisos.test.ts`. Falta la prueba de **cada operación** de E05 con cada rol y sin sesión |
| 04 | Un psicólogo solo ve sus citas | 🟡 | Filtro por dueño en `servidor/citas/datos.ts`. Falta la prueba con dos cuentas contra la BD |
| 05 | Toda entrada validada en el servidor | 🟡 | Esquemas en `contratos/`. Falta comprobar que **cada** operación y ruta los usa (envío directo con datos inválidos) |
| 06 | Límite de intentos en ingreso, recuperación y formularios | ✅ | `servidor/limites.ts` y `limites.test.ts`; ingreso en `cuentas/ingresar.test.ts`. Falta la prueba "10 ingresos fallidos seguidos" extremo a extremo |
| 07 | Anti-spam: campo trampa y límite por IP | ✅ | `sitioWeb` vacío obligatorio en `contratos/cita.ts`; `LIMITES.pedirCita`. Falta el campo trampa en el formulario inscripción de eventos si se reactiva |
| 08 | Ningún secreto en el repositorio | 🟡 | `.env` ignorado, `.env.example` sin valores. **Falta el escaneo de secretos** en CI (p. ej. gitleaks o el de GitHub) |
| 09 | Enlaces con token que caducan y se invalidan | ✅ | `cuentas/enlaces.test.ts` y `citas/enlace.test.ts` |
| 10 | Cookie `HttpOnly`, `Secure`, `SameSite` | 🟡 | `cuentas/sesion.ts`: `httpOnly` y `sameSite=lax` ✅; `secure` solo fuera de `local` ✅. **Difiere de S01:** el nombre es `capl_sesion`, no `__Host-…` (el prefijo exige `Secure` y no funciona en `http://localhost`). Decidir: prefijo solo en pruebas/producción |
| 11 | Segundo paso para administradores | ✅ | `cuentas/segundoPaso.ts` y su prueba |
| 12 | Avisos externos solo con firma válida | ✅ | `POST /api/webhooks/resend` verifica la firma (Svix) y responde 401 si es inválida; ver `servidor/correo/firma.ts` |
| 13 | La app no puede alterar el esquema | ✅ | Roles en `infra/bd/init.sql`; `servidor/bd.permisos.test.ts` |
| 14 | Cabeceras de seguridad y CSP de recursos propios | 🟡 | `next.config.ts`: CSP, HSTS, nosniff, referrer, permisos, `frame-ancestors 'none'`, `no-store` en panel, cita y acceso. **Pendiente:** quitar `'unsafe-inline'` de `script-src` con un nonce generado en `proxy.ts`; comprobar con una herramienta en línea con el sitio publicado |

## Privacidad ligada a seguridad (RNF-PRI)

| # | Requisito | Estado | Evidencia o lo que falta |
|---|-----------|--------|--------------------------|
| 05, 10 | Correos y servicios externos sin motivo ni datos sensibles | 🟡 | Revisar cada plantilla de `correos/` al terminarlas |
| 08 | Medición propia, sin terceros; "no rastrear" respetado | ✅ | `servidor/medicion/medir.ts` y su prueba; `MEDICION=no` por defecto. Falta cargar `public/medir.js` en el diseño final y la aprobación de la universidad (P-24) |
| 09 | Motivo cifrado en la BD | ✅ | `servidor/citas/cifrado.ts` y su prueba. Falta inspección de la tabla |

## Comprobación antes de lanzar ([[S01-Seguridad]])

| ☐ | Prueba | Cómo |
|---|--------|------|
| ☐ | Cada operación de E05 con cada rol y sin sesión | Pruebas de integración contra una BD de pruebas |
| ☐ | Un psicólogo no lee ni cambia nada de otro, ni adivinando identificadores | Dos cuentas, cambiar el id en la URL y en la acción |
| ☐ | Enlace de cita con la firma alterada → rechazado sin revelar nada | Cambiar un carácter del token; mismo mensaje que un token inexistente |
| ☐ | Cabeceras presentes | `curl -I https://…` y una herramienta en línea (securityheaders.com) |
| ☐ | Ningún recurso de otro dominio | Pestaña Red del navegador; la consola no debe mostrar bloqueos de CSP |
| ☐ | Un correo y un documento de prueba no aparecen en los registros | `grep` de ambos valores en `journalctl -u capl*` tras crear una cita de prueba |
| ☐ | Archivo que no es imagen con extensión `.jpg` → rechazado | Subir un `.txt` renombrado (cuando exista la subida de fotos) |
| ☐ | 10 ingresos fallidos seguidos → bloqueo temporal | A mano en pruebas |
| ☐ | El repositorio no contiene secretos | Escaneo completo del historial |
| ☐ | La BD no responde desde fuera | `nc -vz <ip-del-servidor> 5432` desde otra red debe fallar |
| ☐ | CSV con una celda `=1+1` se abre como texto | Exportar y abrir en Excel (cuando exista la exportación) |
| ☐ | Medición: con "no rastrear", ninguna petición a `/api/medir`; nada en `/ingresar` ni en el panel | Pestaña Red |

## Cosas que se decidieron distinto a S01 (hay que cerrar)

- **Grafana/Loki** quedaron descartados (E07, 13-nov): la amenaza A13 y la última casilla de S01 ya no aplican. Los eventos de uso salen por `registrar()`.
- **Nonce de CSP:** necesita `proxy.ts`; mientras tanto `script-src` admite scripts en línea (limitación de Next sin nonce).
- **`npm audit`** estricto en CI (S01): falta añadirlo a `.github/workflows/ci.yml`.
- **Contenedor `non-root` y sistema de archivos de solo lectura:** pertenecen al `Dockerfile` de la fase 2.
