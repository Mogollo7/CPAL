---
tags: [capl, indice]
---

# Cerebro del proyecto — Plataforma CAPL

Plataforma web del **Centro de Atención Psicológica Lasallista (CAPL)**: visibiliza servicios, orienta en emergencias, permite pedir cita en línea con confirmación por correo (Resend), y da a administración y psicólogos en formación un panel para gestionar citas, horarios y eventos.

> Abrir en Obsidian: *Abrir carpeta como bóveda* → seleccionar esta carpeta `cerebro/`.

## Mapa

| # | Nota | Para qué sirve |
|---|------|----------------|
| 01 | [[01-Contexto]] | Qué es el CAPL, qué había antes, actores, decisiones tomadas |
| 02 | [[02-Requisitos-Funcionales]] | Qué hace el sistema (RF con ID, prioridad y responsable) |
| 03 | [[03-Requisitos-No-Funcionales]] | Cómo debe comportarse (seguridad, privacidad, accesibilidad…) |
| 04 | [[04-Restricciones-y-Riesgos]] | Límites legales, técnicos y de equipo; riesgos y mitigación |
| 05 | [[05-Arquitectura]] | Stack, modelo de datos, estados de la cita, correos |
| 06 | [[06-Division-del-Trabajo]] | Quién hace qué y de qué carpeta es dueño |
| 07 | [[07-Protocolo-de-Equipo]] | Ramas, PR, entrega, integración y despliegue |
| 08 | [[08-Ruta-de-Desarrollo]] | Bucle de desarrollo y fases de principio a fin |
| 09 | [[09-Propuestas-por-Autorizar]] | Funcionalidades nuevas: marcar ✅ / ❌ |
| 10 | [[10-Preguntas-Abiertas]] | Lo resuelto y lo que falta decidir |
| 11 | [[11-Cuestionario-CAPL]] | Las preguntas pendientes, listas para enviar al CAPL |
| 12 | [[12-Codigos-de-Emergencia-Borrador]] | Borrador de los códigos de color para empezar el diseño |

## Cerebro de normas

Normativa de diseño y de código, en la carpeta `normas/`. Entrada: [[N00-Normas-Inicio]].

| Nota | Define |
|------|--------|
| [[N01-Principios-de-Bienestar]] | Reglas para que la persona se sienta segura |
| [[N02-Color]] · [[N03-Tipografia-y-Escala-Aurea]] · [[N04-Forma-Espacio-y-Composicion]] | Morado y amarillo, escala áurea, curvas y espacio |
| [[N05-Ilustracion]] | Vectorial plana, formas circulares, sin negro |
| [[N06-Componentes-y-Estados]] · [[N07-Movimiento]] · [[N08-Lenguaje-y-Tono]] | Piezas, animación y forma de hablar |
| [[N09-Accesibilidad-y-Revision]] | Mínimos y listas de revisión |
| [[N10-Tokens-y-Figma]] · [[N11-Normas-Tecnicas]] | Puente Figma–código y convenciones de código |

## Especificación de construcción

El detalle exacto de qué programar, en la carpeta `especificacion/`. Entrada: [[E00-Especificacion-Inicio]].

| Nota | Define |
|------|--------|
| [[E01-Stack-y-Entorno]] | Herramientas, carpetas, variables de entorno, primer día |
| [[E02-Modelo-de-Datos]] | Tablas, campos, restricciones y datos de ejemplo |
| [[E03-Reglas-de-Negocio]] | Cupos, estados de la cita, enlaces, límites, tarea programada |
| [[E04-Pantallas-y-Rutas]] | Todas las páginas y la lista de mockups |
| [[E05-Operaciones-y-Contratos]] | Operaciones del servidor, entradas, salidas, errores, permisos |
| [[E06-Correos]] | Las 14 plantillas: cuándo, a quién, asunto y contenido |
| [[E07-Infraestructura]] | Despliegue, copias de seguridad y recuperación automática |
| [[E08-Backlog]] | 112 tareas por fase, con responsable, dependencias y criterio de hecho |
| [[E09-Flujos-de-Usuario]] | Diagramas de flujo de administrador, persona y psicólogo, con rutas y recorridos de prueba |

## Cerebro del servidor

Normativa de todo lo que el usuario no ve, en la carpeta `servidor/`. Entrada: [[S00-Servidor-Inicio]].

| Nota | Define |
|------|--------|
| [[S01-Seguridad]] | Amenazas consideradas y medidas |
| [[S02-Acceso-y-Permisos]] | Protección del modo administrador y matriz de permisos |
| [[S03-Base-de-Datos]] | Acceso, integridad, transacciones, migraciones, cifrado |
| [[S04-Servicios-Externos]] | Protocolo común; Resend, Gmail y Google Calendar |
| [[S05-Colas-y-Tareas]] | Cola de trabajos, reintentos, tarea programada |
| [[S06-Observabilidad]] | Registros, Loki, Grafana, tableros y alertas |
| [[S07-Medicion-de-Uso]] | Tiempo en pantalla, zonas tocadas, embudo; anónimo |
| [[S08-Mantenimiento]] | Qué ocurre solo, qué se revisa y cuándo, qué hacer ante un incidente |

## Cómo se usa este cerebro

1. Todo requisito tiene un **ID** (`RF-CIT-03`, `RNF-SEG-02`). Las ramas, PR y commits citan ese ID.
2. Si algo cambia, se edita **la nota**, no se crea otra. Una sola fuente de verdad.
3. Lo que no está decidido vive en [[10-Preguntas-Abiertas]]; lo que es idea nueva, en [[09-Propuestas-por-Autorizar]]. Nada entra al desarrollo sin pasar a [[02-Requisitos-Funcionales]].
4. El avance se marca en las casillas de [[08-Ruta-de-Desarrollo]].

## Estado actual

- [x] Levantamiento de requisitos y plan (este cerebro)
- [x] Especificación de construcción y backlog definidos ([[E00-Especificacion-Inicio]]): **listo para programar**
- [x] Cerebro de normas definido ([[N00-Normas-Inicio]]); siguen los mockups del rol A
- [x] Preguntas del equipo resueltas (falta P-08: reparto de roles B y C)
- [ ] Respuestas del CAPL a [[11-Cuestionario-CAPL]]
- [x] Propuestas del lanzamiento autorizadas (quedan por revisar las de "después del lanzamiento")
- [ ] Fase 0 de [[08-Ruta-de-Desarrollo]]
