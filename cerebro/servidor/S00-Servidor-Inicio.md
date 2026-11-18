---
tags: [capl, servidor, indice]
---

# Cerebro del servidor — CAPL

Volver a [[00-Inicio]]. Normativa del **lado del servidor**: seguridad, datos, servicios externos, colas, permisos, observación y mantenimiento. Es el equivalente de [[N00-Normas-Inicio]] (interfaz) para todo lo que el usuario no ve.

> Solo definición. Nada está construido. Responsable de esta carpeta: quien lleva servidor y despliegue ([[06-Division-del-Trabajo]]).

## Mapa

| # | Nota | Define |
|---|------|--------|
| S01 | [[S01-Seguridad]] | Amenazas consideradas y medidas: transporte, entradas, sesiones, secretos, archivos, registros |
| S02 | [[S02-Acceso-y-Permisos]] | Protección del modo administrador, segundo paso de ingreso, matriz de permisos, acciones sensibles |
| S03 | [[S03-Base-de-Datos]] | Usuarios de base de datos, transacciones, migraciones, índices, cifrado, copias |
| S04 | [[S04-Servicios-Externos]] | Protocolo común y conexión con Resend, Gmail y Google Calendar |
| S05 | [[S05-Colas-y-Tareas]] | Cola de trabajos, reintentos, idempotencia, tarea programada |
| S06 | [[S06-Observabilidad]] | Registros, Loki, Grafana, tableros, alertas, catálogo de eventos del sistema |
| S07 | [[S07-Medicion-de-Uso]] | Tiempos en pantalla, zonas más tocadas, embudo del formulario, con privacidad |
| S08 | [[S08-Mantenimiento]] | Qué se hace solo, qué se revisa cada mes y cada semestre, qué hacer ante un incidente |

## Principios

1. **Desconfiar de todo lo que llega.** Navegador, correo, enlaces, archivos y respuestas de terceros se validan siempre.
2. **Mínimo privilegio.** Cada pieza (persona, servicio, usuario de base de datos, llave) puede hacer solo lo que necesita.
3. **Fallar cerrado y con calma.** Ante la duda se niega el acceso; ante un fallo externo, la operación principal se guarda y lo demás se reintenta.
4. **Dejar rastro sin dejar datos.** Todo queda registrado; ningún dato personal queda en un registro.
5. **Nada que requiera a una persona todos los días.** Lo que no se puede automatizar va al calendario de [[S08-Mantenimiento]].
6. **Cada servicio nuevo es deuda.** Se añade solo si resuelve algo concreto; cada uno tiene dueño, límite de memoria y reinicio automático.

## Qué cambia respecto a lo ya planeado

Lo que esta carpeta añade o modifica en la especificación (ya aplicado en las notas indicadas):

| Cambio | Antes | Ahora | Nota afectada |
|--------|-------|-------|---------------|
| Cola | Solo correos (`CorreoSalida`) | Cola general de trabajos (`Trabajo`): correos y calendario | [[E02-Modelo-de-Datos]], [[E03-Reglas-de-Negocio]] |
| Frecuencia de la tarea | Cada 15 min | Cada minuto | [[E03-Reglas-de-Negocio]], [[E07-Infraestructura]] |
| Ingreso de administradores | Correo + contraseña | + código al correo en dispositivos nuevos | [[E02-Modelo-de-Datos]], [[E05-Operaciones-y-Contratos]] |
| Motivo de consulta | Texto | Cifrado en la base de datos | [[E02-Modelo-de-Datos]] |
| Correo | Solo Resend | Resend + respaldo por Gmail + aviso de rebotes | [[E06-Correos]] |
| Calendario | Archivo `.ics` | + calendario compartido de Google (opcional) | [[S04-Servicios-Externos]] |
| Monitoreo | Monitor externo | + Loki y Grafana | [[E07-Infraestructura]] |
| Analítica | Ninguna | Medición propia, anónima y agregada | [[S07-Medicion-de-Uso]] |

Las cinco adiciones quedaron registradas como propuestas PR-24 a PR-28 en [[09-Propuestas-por-Autorizar]].
