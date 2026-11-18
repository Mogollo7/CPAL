---
tags: [capl, servidor, permisos, acceso]
---

# S02 · Acceso y permisos

Volver a [[S00-Servidor-Inicio]]. Protección del modo administrador y quién puede hacer qué.

## Roles

| Rol | Quién | Alcance |
|-----|-------|---------|
| Público | Cualquiera, sin cuenta | Informarse, pedir cita, gestionar **su** cita con el enlace, inscribirse a eventos |
| `PSICOLOGO` | Estudiante en formación | Su perfil, su horario, **sus** citas |
| `ADMIN` | Monitoras y coordinación | Todo el centro |
| Sistema | Tarea programada y cola | Vencer, recordar, enviar, limpiar |
| Operación | Quien mantiene el servidor | Acceso por SSH; **no** tiene por qué tener cuenta de administrador en la aplicación |

No hay más roles. El "docente supervisor" (PR-10) sigue sin aprobar.

## Protección del modo administrador

Un administrador ve los datos de todas las personas que piden cita; su cuenta es el punto más valioso del sistema.

### Segundo paso de ingreso

| Regla | Valor |
|-------|-------|
| A quién aplica | Obligatorio para `ADMIN`; no aplica a `PSICOLOGO` |
| Cómo | Tras la contraseña correcta se envía un **código de 6 dígitos** al correo institucional |
| Vigencia del código | 10 minutos, un solo uso, 5 intentos |
| Dispositivo de confianza | Al acertar, se puede marcar "recordar este dispositivo": no vuelve a pedir código en **30 días** en ese navegador |
| Cuándo se vuelve a pedir | Navegador nuevo, vencidos los 30 días, tras cambiar la contraseña, o si el administrador cierra sus sesiones |
| Almacenamiento | Solo el hash del código y del identificador de dispositivo |
| Si no llega el correo | Reenviar tras 60 segundos; máximo 3 reenvíos por hora |

Se eligió código al correo y no una aplicación autenticadora porque las monitoras cambian cada semestre y el correo institucional ya lo tienen todas. Techo conocido: si alguien controla el buzón institucional, controla la cuenta; por eso el aviso de ingreso de abajo.

### Otras medidas

| Medida | Detalle |
|--------|---------|
| Aviso de ingreso | Correo al administrador cada vez que su cuenta entra desde un dispositivo nuevo: fecha, hora, navegador |
| Sesión más corta | 2 horas de inactividad (8 para psicólogos) |
| Confirmar con contraseña | Antes de cada **acción sensible** (lista abajo), si pasaron más de 10 minutos desde la última confirmación |
| Registro completo | Toda acción de administrador queda en `Auditoria` |
| Mínimo dos administradores | No se puede desactivar ni degradar al último administrador activo |
| Alta de administradores | Solo otro administrador; el nuevo recibe enlace y define su contraseña |
| Cierre de sesiones | Un administrador puede cerrar todas sus sesiones y olvidar sus dispositivos desde "Mi cuenta" |
| Panel no indexado | `noindex` y excluido del mapa del sitio; la ruta no es secreta ni depende de serlo |
| Bloqueo | 5 ingresos fallidos → espera de 15 min; 15 en un día → la cuenta exige recuperar contraseña |
| Baja al cierre de semestre | Lista de comprobación en [[S08-Mantenimiento]] |

### Acciones sensibles

Piden confirmar la contraseña y quedan resaltadas en la auditoría:

- Exportar citas o inscritos a CSV
- Cambiar la configuración (auto-autorización, dominios permitidos, plazos)
- Crear, desactivar o reactivar administradores
- Desactivar un psicólogo
- Cambiar el propio correo o contraseña

### Acceso de emergencia

Si todos los administradores pierden el acceso, quien opera el servidor ejecuta **en el servidor** un comando que crea un administrador y le envía su enlace:

```bash
npm run admin:crear -- --correo persona@dominio --nombre "Nombre"
```

Solo funciona desde la consola del servidor, queda en la auditoría como acción de `Operación` y avisa por correo a los demás administradores.

## Matriz de permisos

✅ permitido · 🔸 solo lo propio · ❌ negado. "Propio" siempre lo decide el servidor a partir de la sesión, nunca un dato enviado por el navegador.

| Recurso | Acción | Público | Psicólogo | Admin | Sistema |
|---------|--------|---------|-----------|-------|---------|
| Páginas informativas y emergencias | Ver | ✅ | ✅ | ✅ | — |
| Cupos | Consultar | ✅ | ✅ | ✅ | — |
| Cita | Crear | ✅ | ❌ | ❌ | — |
| Cita | Ver resumen | 🔸 con enlace | 🔸 | ✅ | — |
| Cita | Ver contacto del paciente | ❌ | 🔸 | ✅ | — |
| Cita | Ver motivo | ❌ | 🔸 | ✅ | — |
| Cita | Cancelar / reprogramar | 🔸 con enlace, a tiempo | ❌ | ✅ | — |
| Cita | Autorizar / rechazar | ❌ | ❌ | ✅ | — |
| Cita | Reasignar / marcar asistencia | ❌ | ❌ | ✅ | — |
| Cita | Vencer / recordar / anonimizar | ❌ | ❌ | ❌ | ✅ |
| Cita | Exportar | ❌ | ❌ | ✅ sensible | — |
| Psicólogo | Crear / editar / desactivar | ❌ | ❌ | ✅ | — |
| Perfil | Ver público | ✅ si es visible | ✅ | ✅ | — |
| Perfil | Editar | ❌ | 🔸 | ❌ | — |
| Horario y ausencias | Editar | ❌ | 🔸 | ❌ | — |
| Bloqueo de todo el centro | Crear / quitar | ❌ | ❌ | ✅ | — |
| Servicio | Editar | ❌ | ❌ | ✅ | — |
| Evento | Ver publicado | ✅ | ✅ | ✅ | — |
| Evento | Crear / editar / publicar | ❌ | ❌ | ✅ | — |
| Inscripción | Crear | ✅ | ✅ | ✅ | — |
| Inscritos | Ver / exportar | ❌ | ❌ | ✅ sensible | — |
| Configuración | Ver / cambiar | ❌ | ❌ | ✅ sensible | — |
| Administradores | Crear / desactivar | ❌ | ❌ | ✅ sensible | — |
| Auditoría | Ver | ❌ | ❌ | ✅ solo lectura | — |
| Cola de trabajos | Ejecutar | ❌ | ❌ | ❌ | ✅ |
| Tableros de Grafana | Ver | ❌ | ❌ | ❌ | Operación |

Decisiones que la matriz fija:

- **El administrador no edita el perfil ni el horario de un psicólogo.** Puede bloquear fechas del centro y desactivarlo, pero el horario es responsabilidad de cada quien.
- **El psicólogo no cancela ni autoriza.** Si no puede atender, registra una ausencia y avisa a administración, que reasigna.
- **Nadie borra una cita.** Solo cambia de estado.
- **La auditoría no se puede editar ni borrar** desde la aplicación.
- **Grafana no usa las cuentas de la aplicación**: tiene su propio ingreso, solo para quien opera.

## Cómo se aplica en el código

1. `exigir(rol)` es la primera línea de toda operación no pública: comprueba sesión, usuario activo y rol.
2. Las consultas de psicólogo llevan **siempre** el filtro por su identificador; no existe una función "traer cita por id" sin dueño para ese rol.
3. Las acciones sensibles llaman además a `exigirConfirmacionReciente()`.
4. Las pantallas ocultan lo que no corresponde, pero eso es comodidad, no seguridad.
5. Una prueba automática recorre **todas** las operaciones con cada rol y sin sesión, y compara contra esta matriz (tarea T-215). Si alguien añade una operación sin declararla en la prueba, la prueba falla.

## Datos que nunca salen del servidor

| Dato | Regla |
|------|-------|
| Hash de contraseña, tokens, códigos | Jamás en una respuesta |
| Motivo de consulta | Solo al psicólogo asignado y a administración; nunca en correos, calendario, registros ni exportación |
| Documento del paciente | Solo en el panel; en la exportación va, y por eso exportar es acción sensible |
| Datos de otros pacientes | Ninguna respuesta pública incluye datos de terceros |
