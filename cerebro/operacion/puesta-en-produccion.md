---
tags: [capl, operacion, produccion]
---

# Puesta en producción de la base de datos (T-602 y T-603)

Volver a [[E07-Infraestructura]]. Reglas de la base: [[S03-Base-de-Datos]]. Todo en el servidor de **producción**, por SSH, con el `.env` de producción. **Nunca** `prisma migrate reset` ni `bd:reiniciar` aquí, y **nunca** la semilla de ejemplo (`prisma/semilla.ts`).

## Antes de empezar

- [ ] Hay copia de seguridad reciente (y la copia externa funciona, P-21).
- [ ] El `.env` tiene `DATABASE_URL` (usuario `capl_app`), `DATABASE_URL_MIGRADOR` (usuario `capl_migrador`), `CLAVE_CIFRADO` guardada aparte, y `ENTORNO=produccion`.
- [ ] Opcional: `CORREO_ADMINISTRACION` y `DOMINIOS_PERMITIDOS` (lista separada por comas). Sin ellos se usan los supuestos de abajo.

## Pasos

1. **Migrar** (crea tablas y restricciones; usa `capl_migrador`):
   `npm run bd:migrar`
2. **Sembrar configuración y servicios** (idempotente; se puede repetir sin riesgo):
   `npm run bd:semilla:produccion`
   Resultado esperado: «Configuración y 6 servicios listos.» No crea usuarios.
3. **Crear el primer administrador** en el servidor con `npm run admin:crear` (ver `scripts/admin-crear.mts` para los argumentos; queda en auditoría). Debe recibir su enlace por correo y entrar. Sin esto no hay panel.
4. **Preparar el CSV de psicólogos**: copiar `infra/plantillas/psicologos-ejemplo.csv`, reemplazar los datos ficticios por los reales que entregue el CAPL.
   - Columnas: `correo,nombre,area,horario`.
   - `area`: `PSICOLOGIA` o `NEUROPSICOLOGIA`.
   - `horario`: bloques separados por `;`, como `lun 08:00-12:00; mar 14:00-18:00`. Días: lun, mar, mié, jue, vie, sáb, dom. Hora de Bogotá.
   - El correo debe ser de un dominio permitido (se lee de la configuración).
   - **No subir el CSV real al repositorio** (tiene datos personales): déjalo fuera de git.
5. **Simular** (no escribe nada; lista los errores por línea):
   `npm run psicologos:cargar -- psicologos.csv --simular`
6. **Cargar de verdad** cuando la simulación salga sin errores:
   `npm run psicologos:cargar -- psicologos.csv`
   Es idempotente: un correo que ya existe se omite y no se le toca el horario (los cambios de horario van por el panel).
7. **Enviar invitaciones**: las cuentas nacen sin contraseña y con perfil **no visible**. Desde el panel de administración, reenviar la invitación a cada psicólogo; cada uno crea su contraseña, revisa su perfil y lo publica.
8. **Verificar (T-603)**: en el formulario de agendamiento aparecen cupos de los servicios en línea. Si no aparecen: revisar que el psicólogo esté activo, con horario, y que haya servicios en línea de su área.
9. Anotar en `infra/BITACORA.md` quién cargó qué y cuándo. Borrar el CSV del servidor.

## Supuestos vigentes (cambiables desde el panel o con la variable indicada)

| Dato | Valor | Pregunta abierta |
|------|-------|------------------|
| Buzón de avisos | `capl@unilasallista.edu.co` (`CORREO_ADMINISTRACION`) | P-17 |
| Dominios de psicólogos | `unilasallista.edu.co` (`DOMINIOS_PERMITIDOS`). Los neuropsicólogos del CES pueden tener otro dominio: añadirlo | P-02 |
| Resto de la configuración | Valores por defecto de [[E03-Reglas-de-Negocio]] §1 | P-13, P-14, P-16 |
| Servicios en línea | Psicología individual, evaluación neuropsicológica y orientación vocacional | P-11 |
| Duración de cita | 60 min en todos los servicios | P-09 |
| Psicólogo atiende | Los servicios en línea de su área | P-11 |

## Por confirmar con el CAPL

Todo `contenido/servicios-produccion.json` lleva `porConfirmar: true`: nombres, descripciones, duración y cuáles se agendan en línea vienen del sitio anterior y falta su validación. Tras confirmarlo, los cambios se hacen desde el panel (la semilla no pisa lo ya guardado).
