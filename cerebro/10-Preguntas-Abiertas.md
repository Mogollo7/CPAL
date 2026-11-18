---
tags: [capl, pendientes]
---

# 10 · Preguntas abiertas

Volver a [[00-Inicio]]. Estado: ✅ resuelta · 🟡 pendiente del CAPL (va en [[11-Cuestionario-CAPL]]) · 🔵 pendiente del equipo.

## Resueltas (13-nov-2026)

| # | Pregunta | Respuesta | Reflejado en |
|---|----------|-----------|--------------|
| P-01 | ¿Aval del CAPL y de la universidad? | ✅ **Sí, de ambos** | [[04-Restricciones-y-Riesgos]] |
| P-02 | Dominio | ✅ Dominio **propio de pruebas** ahora; después uno **oficial**. Los dominios de correo permitidos son configurables | RF-AUT-06, RES-TEC-05 |
| P-06 | Contraseña temporal o enlace | ✅ **Enlace para crear la contraseña**, válido **24–48 h**, se puede abrir varias veces mientras esté vigente, y **queda deshabilitado al crear la contraseña**. Si vence, se solicita otro | RF-AUT-02/03, D-06 |
| P-07 | Stack | ✅ **Confirmado** el de [[05-Arquitectura]] | — |
| P-17 | Buzón de avisos | ✅ El **correo propio del CAPL** | RF-COR-02 |
| P-19 | Dominio definitivo | ✅ **Subdominio** (falta el nombre exacto) | Fase 6 |
| P-20 | Mantenimiento | ✅ Será **mínimo** → la arquitectura debe recuperarse sola de caídas | RNF-REN-07 a 09, D-07 |

## Pendientes del equipo

| # | Pregunta | Estado |
|---|----------|--------|
| P-08 | Reparto | ✅ en parte: **tú llevas diseño, servidor y despliegue**. 🔵 Falta que los otros dos elijan entre sitio público y paneles, y decidir cómo aliviar tu carga ([[06-Division-del-Trabajo]]) |
| P-07b | Datos del servidor (sistema, memoria, Docker) y quién maneja el DNS | 🔵 Antes de T-004 |
| P-22 | ¿El correo del CAPL es de Google? ¿La universidad permite contraseñas de aplicación (respaldo por Gmail) y compartir un calendario con una cuenta de servicio (calendario compartido)? | 🔵 Antes de la fase 3b; si no, PR-24 y PR-25 se omiten sin afectar lo demás |
| P-23 | ¿Cuánta memoria tiene el servidor? Loki y Grafana piden cerca de 1 GB adicional | 🔵 Antes de T-015 |
| P-24 | ¿La universidad aprueba declarar la medición de uso anónima en la política de datos? | 🟡 Antes de la fase 5; sin aprobación, `MEDICION=no` |
| P-25 | ¿Quién será la **segunda persona** con acceso al servidor y al plan de mantenimiento? | 🔵 Antes del lanzamiento |
| P-21 | ¿A dónde va la copia de seguridad externa? (otro servidor o almacenamiento institucional) | 🔵 Antes de la fase 5; sin ella no se lanza |

## Pendientes del CAPL

| # | Pregunta | Bloquea | Mientras tanto |
|---|----------|---------|----------------|
| P-03 | Códigos de emergencia por color | Fase 1 | Se diseña con [[12-Codigos-de-Emergencia-Borrador]] |
| P-04 | Líneas de ayuda oficiales | Fase 1 | Marcadores, sin números |
| P-05 | Vigencia del contenido del sitio anterior | Fase 1 | Se usa el contenido anterior |
| P-09 | Duración de la cita por servicio | Fase 3 | 60 min, configurable |
| P-10 | ¿El paciente elige psicólogo o se asigna? | Fase 3 | ✅ **El paciente puede escogerlo** (decidido 13-nov-2026). Falta que el CAPL confirme si además se ofrece "cualquiera disponible" (RF-CIT-04) |
| P-11 | ¿Qué servicios se agendan en línea? | Fase 3 | Campo "se agenda en línea" por servicio |
| P-12 | ¿Quién autoriza? | Fase 3 | Solo administración |
| P-13 | Datos obligatorios y atención a menores | Fase 3 | 🟡 Por definir |
| P-14 | Anticipación y citas activas por persona | Fase 3 | 🟡 Por definir; valores configurables |
| P-15 | ¿Seguimiento por la web? | Fase 3 | 🟡 Por definir; la web agenda solo la primera cita |
| P-16 | Tiempo de conservación de datos | Fase 3 | 1 año, configurable |
| P-18 | Cupo y público de los eventos | Fase 4 | 🟡 Por definir; se soportan ambas opciones por evento |

**Regla:** todo lo que está "por definir" se construye como **valor configurable** en el panel, no como regla fija en el código. Así la respuesta del CAPL no obliga a reprogramar.

> Sobre P-03 y P-04: el equipo **no inventa ni completa** esta información. Un número equivocado en esa página es el peor error posible del proyecto (RG-07).
