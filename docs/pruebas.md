← [README](../README.md) · [Anterior: Operación](operacion.md) · [Siguiente: Diseño](diseno.md)

# Pruebas

| Comando               | Qué comprueba                                                       | Necesita                         |
| --------------------- | ------------------------------------------------------------------- | -------------------------------- |
| `npm run lint`        | ESLint y formato Prettier                                           | —                                |
| `npm run tipos`       | TypeScript                                                          | —                                |
| `npm run pruebas`     | Vitest: lógica y servidor (cupos, estados, cola, permisos, cuentas) | PostgreSQL migrado y con semilla |
| `npm run build`       | Compilación de producción                                           | Variables de entorno             |
| `npm run pruebas:e2e` | Playwright en navegador                                             | Sitio levantado y Chrome         |

## Extremo a extremo

| Archivo                                                           | Cubre                                           |
| ----------------------------------------------------------------- | ----------------------------------------------- |
| [`navegacion.spec.ts`](../e2e/navegacion.spec.ts)                 | Recorrido por las páginas                       |
| [`enlaces.spec.ts`](../e2e/enlaces.spec.ts)                       | Enlaces internos válidos y botones accesibles   |
| [`formularios.spec.ts`](../e2e/formularios.spec.ts)               | Filtro de eventos, consulta y solicitud de cita |
| [`ingreso.spec.ts`](../e2e/ingreso.spec.ts)                       | Pantallas de acceso                             |
| [`movimiento-publico.spec.ts`](../e2e/movimiento-publico.spec.ts) | Transiciones y movimiento reducido              |

Otro destino: define `E2E_URL`. Sin Chrome instalado, ejecuta `npx playwright install chromium` y define `E2E_CANAL=chromium`.

## Integración continua

Cada PR ejecuta el escaneo de secretos, `npm audit`, lint, tipos, la preparación de la base, las pruebas y la compilación. El flujo no incluye las pruebas de extremo a extremo.

## Accesibilidad

La revisión se guía por [N09](../cerebro/normas/N09-Accesibilidad-y-Revision.md). La prueba con personas usa el [guion de usuarios](../cerebro/operacion/guion-prueba-usuarios.md).
