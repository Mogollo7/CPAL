← [README](../README.md) · [Anterior: Guía de uso](guia-de-uso.md) · [Siguiente: Arquitectura](arquitectura.md)

# Capacidades

## Por módulo

| Módulo                  | Qué hace                                                                                                      | Rutas                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Sitio público           | Información del centro, servicios, equipo, contacto, privacidad y términos                                    | `/`, `/como-funciona`, `/servicios`, `/equipo`, `/contacto`, `/privacidad`, `/terminos` |
| Ayuda inmediata         | Orientador de preguntas, tarjetas por código, líneas de ayuda y ejercicio de anclaje                          | `/ayuda-inmediata`                                                                      |
| Citas                   | Cupos reales, cinco pasos, enlace privado para ver, cancelar o reprogramar                                    | `/pedir-cita`, `/cita/[token]`                                                          |
| Eventos                 | Cartelera y detalle, sin inscripción (RF-EVE-03 a 05 descartados)                                             | `/eventos`                                                                              |
| Cuentas                 | Ingreso, segundo paso, invitación y recuperación de contraseña                                                | `/ingresar`, `/crear-clave/[token]`, `/recuperar-clave`                                 |
| Panel del psicólogo     | Citas, pacientes, horario, perfil y cuenta                                                                    | `/panel/psicologo/…`                                                                    |
| Panel de administración | Citas, calendario, equipo, psicólogos, eventos, servicios, bloqueos, configuración, correos fallidos y cuenta | `/panel/admin/…`                                                                        |
| Correo                  | 18 [plantillas](correos.md), cola con reintentos y rotación de llaves de Resend                               | —                                                                                       |
| Tareas automáticas      | Vencer solicitudes, recordar, anonimizar, limpiar e informe diario                                            | `POST /api/tareas`                                                                      |

## Reglas configurables

Se cambian desde el panel; estos son los valores por defecto.

| Regla                                      | Valor                                                 |
| ------------------------------------------ | ----------------------------------------------------- |
| Autorización automática                    | No                                                    |
| Anticipación para pedir cita               | Mínimo 24 horas, máximo 30 días                       |
| Plazo para cancelar o reprogramar          | 12 horas antes                                        |
| Citas activas por persona                  | 1                                                     |
| Reprogramaciones por cita                  | 2                                                     |
| Vencimiento de una solicitud sin respuesta | 48 horas, o 2 horas antes de la cita si llega primero |
| Vigencia del enlace de contraseña          | 48 horas                                              |
| Conservación de datos personales           | 12 meses                                              |

## Fuera de alcance

- Sin cuentas de paciente, historia clínica, chat, autodiagnóstico, aplicación nativa ni pagos.
- El respaldo de correo por Gmail y el calendario compartido de Google están especificados en [S04](../cerebro/servidor/S04-Servicios-Externos.md), pero el código actual envía solo por Resend y no publica en Google Calendar. Los correos sí traen archivo `.ics` y enlaces de calendario.

Fuente detallada: [Requisitos funcionales](../cerebro/02-Requisitos-Funcionales.md) · [Reglas de negocio](../cerebro/especificacion/E03-Reglas-de-Negocio.md)
