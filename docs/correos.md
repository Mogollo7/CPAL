← [README](../README.md) · [Anterior: Segundo paso (2FA)](autenticacion-2fa.md) · [Siguiente: Instalación y entornos](instalacion-y-entornos.md)

# Correos

<p align="center"><img src="img/doc-correos.webp" alt="" width="70%"></p>

Las plantillas viven en [`correos/`](../correos) y tienen versión HTML y de texto. Casi todas comparten [`base.ts`](../correos/base.ts). Las vistas usan los datos de ejemplo de cada archivo. «Administración» es el correo configurado para recibir avisos.

`npm run correos` genera el HTML y el texto de todas en `datos/archivos/vista-previa-correos/`, sin enviar nada.

## Citas

| Plantilla                  | Cuándo se envía                                   | Destinatario      | Vista previa                                                                                                                                                    |
| -------------------------- | ------------------------------------------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `solicitud-recibida`       | Se crea una cita pendiente                        | Solicitante       | <a href="img/correos/solicitud-recibida.png"><img src="img/correos/solicitud-recibida.png" alt="Vista de solicitud-recibida" width="220"></a>                   |
| `nueva-solicitud`          | Se crea una cita pendiente                        | Administración    | <a href="img/correos/nueva-solicitud.png"><img src="img/correos/nueva-solicitud.png" alt="Vista de nueva-solicitud" width="220"></a>                            |
| `cita-autorizada`          | La cita queda autorizada                          | Solicitante       | <a href="img/correos/cita-autorizada.png"><img src="img/correos/cita-autorizada.png" alt="Vista de cita-autorizada" width="220"></a>                            |
| `cita-no-autorizada`       | La cita se rechaza                                | Solicitante       | <a href="img/correos/cita-no-autorizada.png"><img src="img/correos/cita-no-autorizada.png" alt="Vista de cita-no-autorizada" width="220"></a>                   |
| `cita-vencida`             | La solicitud vence sin respuesta                  | Solicitante       | <a href="img/correos/cita-vencida.png"><img src="img/correos/cita-vencida.png" alt="Vista de cita-vencida" width="220"></a>                                     |
| `cita-cancelada`           | La cita se cancela                                | Solicitante       | <a href="img/correos/cita-cancelada.png"><img src="img/correos/cita-cancelada.png" alt="Vista de cita-cancelada" width="220"></a>                               |
| `cita-reasignada`          | Administración cambia el horario o el profesional | Solicitante       | <a href="img/correos/cita-reasignada.png"><img src="img/correos/cita-reasignada.png" alt="Vista de cita-reasignada" width="220"></a>                            |
| `recordatorio`             | Unas 24 horas antes                               | Solicitante       | <a href="img/correos/recordatorio.png"><img src="img/correos/recordatorio.png" alt="Vista de recordatorio" width="220"></a>                                     |
| `enlace-cita`              | Alguien consulta la cita con su código            | Correo de la cita | <a href="img/correos/enlace-cita.png"><img src="img/correos/enlace-cita.png" alt="Vista de enlace-cita" width="220"></a>                                        |
| `cita-nueva-psicologo`     | Se autoriza una cita                              | Psicólogo         | <a href="img/correos/cita-nueva-psicologo.png"><img src="img/correos/cita-nueva-psicologo.png" alt="Vista de cita-nueva-psicologo" width="220"></a>             |
| `cita-cancelada-psicologo` | Se cancela una cita autorizada                    | Psicólogo         | <a href="img/correos/cita-cancelada-psicologo.png"><img src="img/correos/cita-cancelada-psicologo.png" alt="Vista de cita-cancelada-psicologo" width="220"></a> |

## Cuentas y seguridad

| Plantilla                 | Cuándo se envía                                        | Destinatario              | Vista previa                                                                                                                                                 |
| ------------------------- | ------------------------------------------------------ | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `invitacion`              | Se crea una cuenta o se reenvía la invitación          | Psicólogo o administrador | <a href="img/correos/invitacion.png"><img src="img/correos/invitacion.png" alt="Vista de invitacion" width="220"></a>                                        |
| `recuperar-clave`         | Se pide una contraseña nueva                           | Titular de la cuenta      | <a href="img/correos/recuperar-clave.png"><img src="img/correos/recuperar-clave.png" alt="Vista de recuperar-clave" width="220"></a>                         |
| `codigo-ingreso`          | Ingreso desde un navegador sin confianza               | Administrador             | <a href="img/correos/codigo-ingreso.png"><img src="img/correos/codigo-ingreso.png" alt="Vista de codigo-ingreso" width="220"></a>                            |
| `aviso-ingreso`           | Se verifica un código de ingreso                       | Administrador             | <a href="img/correos/aviso-ingreso.png"><img src="img/correos/aviso-ingreso.png" alt="Vista de aviso-ingreso" width="220"></a>                               |
| `aviso-acceso-emergencia` | Se crea un administrador desde la consola del servidor | Demás administradores     | <a href="img/correos/aviso-acceso-emergencia.png"><img src="img/correos/aviso-acceso-emergencia.png" alt="Vista de aviso-acceso-emergencia" width="220"></a> |

## Informe y eventos

| Plantilla            | Cuándo se envía                               | Destinatario   | Vista previa                                                                                                                                  |
| -------------------- | --------------------------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `estado-servidor`    | Una vez al día, desde las 8:00 (Bogotá)       | Administración | <a href="img/correos/estado-servidor.png"><img src="img/correos/estado-servidor.png" alt="Vista de estado-servidor" width="220"></a>          |
| `inscripcion-evento` | Sin uso: la inscripción a eventos se descartó | Inscrito       | <a href="img/correos/inscripcion-evento.png"><img src="img/correos/inscripcion-evento.png" alt="Vista de inscripcion-evento" width="220"></a> |

En el entorno de pruebas los envíos se redirigen al equipo (`CORREO_REDIRIGIR_A`).

Fuente detallada: [E06 · Correos](../cerebro/especificacion/E06-Correos.md) · [Lista de entrega](../cerebro/operacion/lista-entrega-correos.md)
