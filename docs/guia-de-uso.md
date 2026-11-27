← [README](../README.md) · [Siguiente: Capacidades](capacidades.md)

# Guía de uso

<p align="center"><img src="img/doc-guia-de-uso.webp" alt="" width="70%"></p>

> El CAPL **no es un servicio de urgencias**. En una crisis, llama al 123 o entra a `/ayuda-inmediata`.

Sitio en vivo: **[capl.juanlabs.me](https://capl.juanlabs.me)**. Las rutas de esta guía (`/pedir-cita`, `/ingresar`…) van después de esa dirección.

## Visitante (sin cuenta)

| Quiero                        | Pasos                                                                                                                                                     |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pedir una cita                | `/pedir-cita`: servicio → para quién (yo, otra persona, un menor) → profesional y horario → datos → revisar, aceptar el tratamiento de datos y enviar     |
| Saber en qué va               | El correo trae un enlace privado `/cita/…` con el estado. La cita nace **pendiente** hasta que administración la autoriza (salvo autorización automática) |
| Recuperar el enlace           | En el pie del sitio, consulta con el código de la cita: el enlace llega **al correo de la cita**, nunca se muestra en pantalla                            |
| Cancelar o cambiar el horario | Desde el mismo enlace, hasta 12 horas antes (configurable) y máximo 2 reprogramaciones                                                                    |
| Pedir ayuda ya                | Botón «Necesito ayuda ahora» → `/ayuda-inmediata`: orientador, líneas con botón de llamada y primeros auxilios emocionales                                |
| Conocer el centro             | `/como-funciona`, `/servicios`, `/equipo`, `/eventos`, `/contacto`                                                                                        |

## Psicólogo

1. Recibe una invitación por correo y crea su contraseña con ese enlace.
2. Ingresa en `/ingresar` (sin segundo paso).
3. Completa **Mi perfil** (foto, presentación, servicios) y **Mi horario** (bloques semanales y ausencias). Sin horario no aparecen cupos.
4. En **Mis citas** y **Pacientes** ve únicamente lo suyo, incluidos contacto y motivo.
5. No autoriza ni cancela: si no puede atender, registra la ausencia y avisa a administración.

## Administración

1. Ingresa en `/ingresar`; en un navegador nuevo escribe el [código de 6 dígitos](autenticacion-2fa.md).
2. **Citas:** revisa las pendientes y autoriza o rechaza (con motivo). Si nadie responde a tiempo, vencen solas.
3. Después de la cita, marca **atendida** o **no asistió**. También puede cancelar o reasignar.
4. **Equipo y psicólogos:** invita, reenvía invitaciones y desactiva cuentas.
5. **Eventos, servicios, fechas bloqueadas y configuración** se gestionan desde el panel.
6. Si hay correos que agotaron sus reintentos, aparecen en **Correos fallidos** para volver a ponerlos en la cola.

Fuente detallada: [Manual de administración](../cerebro/operacion/Manual-de-Administracion.md) · [Flujos de usuario](../cerebro/especificacion/E09-Flujos-de-Usuario.md)
