---
tags: [capl, operacion, bitacora]
---

# Bitácora de mantenimiento (T-515)

Volver a [[S08-Mantenimiento]]. Una línea por hecho, **la más reciente arriba**. Se anota: incidentes, consultas manuales en producción, rotaciones de secretos, simulacros de restauración, pruebas de alerta, cambios de personas con acceso y despliegues con problemas. **Sin datos personales ni valores de secretos.**

## Cómo anotar

| Campo | Contenido |
|-------|-----------|
| Fecha y hora | Hora de Bogotá |
| Tipo | `incidente` · `consulta-manual` · `rotación` · `simulacro` · `alerta-prueba` · `acceso` · `despliegue` · `revisión` |
| Quién | Nombre de quien lo hizo |
| Qué pasó / qué se hizo | Una o dos frases |
| Causa y qué cambia para que no se repita | Solo en incidentes |

## Registro

| Fecha | Tipo | Quién | Qué pasó / qué se hizo | Causa y mejora |
|-------|------|-------|------------------------|----------------|
| 2026-11-16 | revisión | equipo | Se crean el inventario de secretos, esta bitácora, la lista de seguridad y los scripts de copia, restauración y tarea programada. **Nada de esto se ha ejecutado aún contra un servidor real.** | — |

## Pendientes antes del lanzamiento

- [ ] Primera copia real y **simulacro de restauración** en pruebas, hecho por la segunda persona sola (T-506, T-515).
- [ ] **Alerta de prueba** del monitor externo recibida por el equipo y por el CAPL (T-508).
- [ ] Nombrar a la **segunda persona** con acceso y manual leído (P-25).
- [ ] Recordatorios mensuales y semestrales creados en el calendario de quien opera.
- [ ] Definir el destino de la copia externa (P-21): sin él no se lanza.

## Recordatorios (crear en el calendario de quien opera)

| Cuándo | Qué | Dónde está la lista |
|--------|-----|---------------------|
| Cada lunes | Revisión semanal: `/api/salud`, journal de `capl-tareas` y copia de hoy | [[S08-Mantenimiento]] |
| Primer lunes del mes | Revisión mensual: disco, avisos de dependencias, copia externa de hoy, hallazgos de uso | [[S08-Mantenimiento]] |
| Inicio de cada semestre | Lista del semestre: personas, secretos, contenido del CAPL, simulacro | [[S08-Mantenimiento]] y [[Inventario-de-Secretos]] |
| Cada año | Versiones mayores, costo de argon2id, dominio, aval | [[S08-Mantenimiento]] |
