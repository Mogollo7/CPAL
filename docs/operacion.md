← [README](../README.md) · [Anterior: Instalación y entornos](instalacion-y-entornos.md) · [Siguiente: Pruebas](pruebas.md)

# Operación

<p align="center"><img src="img/doc-operacion.webp" alt="" width="70%"></p>

## Tareas automáticas

Un temporizador llama a `POST /api/tareas` cada minuto con `CRON_SECRET`: procesa la cola, vence solicitudes, envía recordatorios, anonimiza, limpia y encola el informe diario. Cada paso se puede repetir sin duplicar efectos.

## Respaldos

| Copia                                | Dónde                                        | Retención     |
| ------------------------------------ | -------------------------------------------- | ------------- |
| Diaria (base y archivos), 2:00 a. m. | Local                                        | 14 días       |
| La misma, cifrada con AES-256        | Carpeta externa y destino remoto por `rsync` | 30 días       |
| Antes de desplegar                   | Local                                        | Las 5 últimas |

Para restaurar se usa `infra/restaurar.sh <copia>`. Cada semestre se hace un simulacro. La frase de cifrado se guarda aparte de las copias.

## Observabilidad

| Medida                          | Detalle                                                   |
| ------------------------------- | --------------------------------------------------------- |
| `GET /api/salud`                | Comprueba la aplicación y la base de datos                |
| Comprobación de salud de Docker | Vigila esa ruta                                           |
| Registros                       | Una línea JSON por evento, sin datos personales           |
| Monitor externo                 | Se configura en el servidor: avisa tras 2 fallos seguidos |
| Informe diario                  | Correo a administración desde las 8:00                    |

## Despliegue

El sitio está publicado en **[capl.juanlabs.me](https://capl.juanlabs.me)** a través de un Cloudflare Tunnel.

[`ci.yml`](../.github/workflows/ci.yml) verifica cada PR y cada cambio en `main`. [`desplegar.yml`](../.github/workflows/desplegar.yml) publica las imágenes y actualiza el servidor de pruebas.

> **Estado:** según [infra/README.md](../infra/README.md), la imagen de la aplicación se construye en local, pero el Compose de producción y el flujo de despliegue **no se han ejecutado en un servidor**.

Fuente detallada: [infra/README.md](../infra/README.md) · [Puesta en producción](../cerebro/operacion/puesta-en-produccion.md) · [Mantenimiento](../cerebro/servidor/S08-Mantenimiento.md) · [Observabilidad](../cerebro/servidor/S06-Observabilidad.md) · [Bitácora](../cerebro/operacion/Bitacora.md)
