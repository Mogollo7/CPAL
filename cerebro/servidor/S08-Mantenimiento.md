---
tags: [capl, servidor, mantenimiento]
---

# S08 · Mantenimiento

Volver a [[S00-Servidor-Inicio]]. Qué mantiene vivo el sistema después del lanzamiento. Objetivo (D-07): que **casi todo ocurra solo** y lo demás quepa en una lista corta con fecha.

## Lo que ocurre solo

| Qué | Cada cuánto | Quién lo hace |
|-----|-------------|---------------|
| Reinicio de un servicio caído | Al instante | Docker |
| Arranque tras reinicio del servidor | Al instante | Docker |
| Renovación del certificado HTTPS | Antes de vencer | Proxy |
| Copia de seguridad local y externa | Diaria | Servicio `respaldo` |
| Borrado de copias antiguas | Diaria | Servicio `respaldo` |
| Envío y reintento de correos | Cada minuto | Tarea programada |
| Vencimiento de solicitudes, recordatorios | Cada minuto / 15 min | Tarea programada |
| Reconciliación del calendario | Diaria | Tarea programada |
| Anonimización y limpieza | Diaria | Tarea programada |
| Rotación y borrado de registros | Continuo / 30 días | Docker y Loki |
| Parches de seguridad del sistema operativo | Diaria | Sistema operativo |
| Avisos de dependencias vulnerables | Continuo | GitHub |
| Festivos del año siguiente | Automático | Librería |
| Alertas | Continuo | Grafana y monitor externo |

## Lo que revisa una persona

### Cada semana — 5 minutos

- [ ] Abrir el tablero **Estado**: sin alertas abiertas.
- [ ] Tablero **Correos**: cero trabajos fallidos.

### Cada mes — 30 minutos

- [ ] Tablero **Seguridad**: ingresos fallidos, permisos negados, exportaciones. ¿Algo fuera de lo normal?
- [ ] Tablero **Citas**: solicitudes vencidas por falta de respuesta. Si son muchas, avisar al CAPL.
- [ ] Tablero **Uso**: abandono en el formulario, campos con errores, búsquedas sin cupo. Anotar hallazgos para el CAPL.
- [ ] Consumo del plan de Resend.
- [ ] Espacio en disco y tamaño de la base de datos.
- [ ] Avisos de seguridad de dependencias: aplicar los de severidad alta o crítica.
- [ ] Confirmar que existe una copia de seguridad externa de hoy.

### Cada semestre — medio día

Coincide con el cambio de monitoras y de psicólogos en formación.

**Personas y accesos**
- [ ] Desactivar psicólogos que terminaron su práctica (reasignando antes sus citas futuras).
- [ ] Invitar a los nuevos psicólogos.
- [ ] Revisar la lista de administradores: desactivar a quien ya no esté; confirmar que quedan al menos dos.
- [ ] Capacitar a las nuevas monitoras con el manual.
- [ ] Revisar quién tiene acceso al servidor, a GitHub, a Resend, a Google y a Grafana; retirar a quien ya no participa.

**Secretos**
- [ ] Rotar: `AUTH_SECRET`, llave de Resend, secreto del webhook, `CRON_SECRET`, contraseña de aplicación de Gmail, llave de la cuenta de servicio de Google, contraseña de Grafana, contraseñas de la base de datos.
- [ ] Anotar la fecha en el inventario de `infra/README.md`.

> Rotar `AUTH_SECRET` cierra todas las sesiones e **invalida los enlaces de gestión de cita ya enviados**. Se hace en un momento de baja actividad y se mantiene la llave anterior como válida durante 7 días para los enlaces en curso.

**Contenido**
- [ ] El CAPL revisa y confirma **líneas de ayuda y códigos de emergencia**; se actualiza la fecha de "última revisión". Se verifica cada número llamando.
- [ ] Revisar servicios, horarios, preguntas frecuentes y datos de contacto.
- [ ] Revisar la política de datos si cambió algo de lo que se recoge.

**Sistema**
- [ ] **Simulacro de restauración**: restaurar la última copia en el entorno de pruebas y comprobar que el sistema arranca.
- [ ] Actualizar dependencias (versiones menores) en una sola entrega, probada en el entorno de pruebas.
- [ ] Revisar que las actualizaciones automáticas del sistema operativo siguen activas y si hay un reinicio pendiente.
- [ ] Revisar alertas: eliminar las que saltaron sin motivo; añadir las que hicieron falta.
- [ ] Revisar la configuración (plazos, límites) con el CAPL a la luz de los tableros.

### Cada año

- [ ] Evaluar versiones mayores: Node.js, Next.js, PostgreSQL, Prisma. Actualizar solo las que dejan de recibir soporte de seguridad; una a la vez.
- [ ] Revisar el costo de argon2id.
- [ ] Renovación del dominio y vigencia del aval institucional.
- [ ] Revisar `CLAVE_CIFRADO` (ver abajo).
- [ ] Revisar este plan: ¿sobra o falta algo?

## Rotación de la llave de cifrado

`CLAVE_CIFRADO` protege el motivo de consulta. Como los motivos se anonimizan al año, la rotación es sencilla: se añade la llave nueva, los datos nuevos se cifran con ella, y la anterior se conserva solo para leer hasta que el último dato cifrado con ella se anonimice. Cada valor cifrado guarda qué versión de llave usó. **Nunca se borra una llave mientras existan datos cifrados con ella.** La llave se guarda en un lugar distinto al de las copias de seguridad.

## Política de cambios tras el lanzamiento

| Tipo de cambio | Cómo |
|----------------|------|
| Contenido (textos, líneas de ayuda, servicios) | Editar el archivo de `contenido/`, PR, despliegue |
| Configuración (plazos, límites, auto-autorización) | Desde el panel, sin desplegar |
| Corrección de un error | Rama, PR, pruebas, entorno de pruebas, etiqueta, producción |
| Parche de seguridad | Igual, con prioridad; se puede saltar la espera en pruebas si es crítico |
| Funcionalidad nueva | Pasa por [[09-Propuestas-por-Autorizar]] |

Nunca se cambia nada directamente en el servidor de producción. Todo cambio deja rastro en GitHub.

## Ante un incidente

### Pasos generales

1. **Confirmar**: abrir el sitio y el tablero Estado. ¿Qué falla exactamente?
2. **Contener**: si hay riesgo para los datos, primero se corta el acceso (ver tabla), después se investiga.
3. **Avisar** al CAPL en lenguaje sencillo: qué pasa, a quién afecta, qué hacer mientras tanto (atender por WhatsApp y correo como antes).
4. **Resolver** siguiendo la tabla.
5. **Anotar** en `infra/BITACORA.md`: qué pasó, cuándo, causa, qué se hizo, qué se cambia para que no se repita.

### Casos

| Señal | Causa probable | Qué hacer |
|-------|----------------|-----------|
| Sitio caído | Servidor apagado o sin red | Esperar 5 min (se recupera solo). Si sigue, entrar por SSH y revisar el estado de los servicios; revisar disco |
| Sitio arriba, formulario con error | Base de datos caída | Reiniciar el servicio `db`; revisar sus registros y el disco. Las páginas informativas siguen funcionando |
| No llegan correos | Resend caído, llave vencida o dominio con problema | Tablero Correos: ver el error. Comprobar el panel de Resend. Los correos esperan en cola y saldrán al resolverse |
| Correos llegan a no deseado | Configuración del dominio | Revisar SPF, DKIM y DMARC en el panel de Resend |
| Cola parada | El servicio `tareas` cayó | Reiniciarlo; los trabajos pendientes se procesan solos |
| Calendario desfasado | Fallo de Google o permiso retirado | Comprobar que el calendario sigue compartido con la cuenta de servicio; la reconciliación diaria lo corrige |
| Disco lleno | Registros o copias | Borrar copias locales antiguas; revisar la retención |
| Despliegue rompió algo | Error en la versión nueva | **Volver a la etiqueta anterior**; investigar después |
| Migración falló | — | El despliegue se detuvo solo; la versión anterior sigue activa. Corregir la migración |
| Muchos ingresos fallidos | Intento de acceso | Los límites ya actúan. Revisar el tablero Seguridad; si apuntan a una cuenta, pedirle cambiar la contraseña |
| Administrador sin acceso | Contraseña o correo | Otro administrador le reenvía el enlace; si no hay ninguno, acceso de emergencia ([[S02-Acceso-y-Permisos]]) |
| **Sospecha de acceso indebido a datos** | Cuenta comprometida o fallo de permisos | Ver abajo |

### Sospecha de fuga o acceso indebido

1. Desactivar la cuenta implicada y cerrar todas las sesiones (rotar `AUTH_SECRET`).
2. Rotar todos los secretos.
3. Conservar los registros y la auditoría del periodo (exportarlos antes de que cumplan 30 días).
4. Determinar con la auditoría qué datos se vieron o exportaron.
5. **Informar de inmediato al CAPL y a la universidad.** La decisión de notificar a las personas afectadas y a la autoridad de protección de datos es de la institución, con su asesoría jurídica; el equipo técnico aporta los hechos.
6. Corregir la causa y documentar.

## Quién mantiene

| Responsabilidad | Quién |
|-----------------|-------|
| Revisión semanal y mensual | Quien opera el servidor |
| Lista del semestre | Quien opera + administración del CAPL |
| Contenido y líneas de ayuda | CAPL |
| Recibir alertas | Quien opera (todas) y CAPL (las marcadas ★ en [[S06-Observabilidad]]) |
| Decisiones ante una fuga | CAPL y universidad |

Antes del lanzamiento se nombra a una **segunda persona** con acceso y este documento leído: un sistema que depende de una sola persona no tiene mantenimiento, tiene suerte.

## Entregables de mantenimiento

| Archivo | Contenido |
|---------|-----------|
| `infra/README.md` | Desplegar, volver atrás, restaurar; inventario de secretos (sin valores) |
| `infra/BITACORA.md` | Incidentes, consultas manuales en producción, rotaciones |
| Manual del CAPL | Una página: qué hacer si algo falla y a quién escribir |
| Calendario | Recordatorios mensuales y semestrales en el calendario de quien opera |
