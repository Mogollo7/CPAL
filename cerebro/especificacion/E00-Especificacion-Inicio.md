---
tags: [capl, especificacion, indice]
---

# Especificación de construcción — CAPL

Volver a [[00-Inicio]]. Aquí está el **detalle pormenorizado**: con esto, lo único que queda es programar. Los requisitos dicen *qué*; las normas dicen *cómo se ve y se escribe*; esta carpeta dice **exactamente qué construir**.

> Solo definición. Ningún archivo de código existe todavía.

## Mapa

| # | Nota | Responde a |
|---|------|-----------|
| E01 | [[E01-Stack-y-Entorno]] | ¿Con qué se construye, qué carpetas hay, qué variables de entorno, cómo se arranca el primer día? |
| E02 | [[E02-Modelo-de-Datos]] | ¿Qué tablas, campos, restricciones y datos de ejemplo? |
| E03 | [[E03-Reglas-de-Negocio]] | ¿Cómo se calculan los cupos, qué puede pasar con una cita, cómo funcionan los enlaces, qué hace la tarea programada? |
| E04 | [[E04-Pantallas-y-Rutas]] | ¿Qué páginas existen, en qué dirección, quién entra y qué muestran? |
| E05 | [[E05-Operaciones-y-Contratos]] | ¿Qué operaciones ofrece el servidor, con qué entrada, salida, permisos y errores? |
| E06 | [[E06-Correos]] | ¿Qué correos salen, cuándo, a quién, con qué asunto y contenido? |
| E07 | [[E07-Infraestructura]] | ¿Cómo se despliega, se respalda y se recupera solo? |
| E08 | [[E08-Backlog]] | ¿Qué tareas hay, en qué orden, de quién, y cuándo está hecha cada una? |
| E09 | [[E09-Flujos-de-Usuario]] | ¿Qué camino recorre el administrador, la persona, el psicólogo? Diagramas con rutas y recorridos de prueba |

## Orden de lectura por rol

| Rol | Lee primero | Luego |
|-----|-------------|-------|
| A — diseño y sitio público | [[N00-Normas-Inicio]], [[E04-Pantallas-y-Rutas]] | [[E05-Operaciones-y-Contratos]] (qué datos pide y recibe cada pantalla), [[E06-Correos]] |
| B — servidor y datos | [[E02-Modelo-de-Datos]], [[E03-Reglas-de-Negocio]] | [[E05-Operaciones-y-Contratos]], [[E06-Correos]], [[N11-Normas-Tecnicas]] |
| C — paneles e infraestructura | [[E07-Infraestructura]], [[E04-Pantallas-y-Rutas]] | [[E05-Operaciones-y-Contratos]], [[N06-Componentes-y-Estados]] |
| Todos | [[E01-Stack-y-Entorno]], [[E08-Backlog]], [[07-Protocolo-de-Equipo]] | — |

## Lo único que no depende de esta especificación

Nada de esto impide empezar; cada punto tiene un valor provisional ya definido.

| Pendiente | De quién | Mientras tanto |
|-----------|----------|----------------|
| Quién es B y quién es C (P-08) | Los otros dos integrantes | Las tareas están por rol, no por nombre |
| Datos del servidor y acceso al DNS (P-07b) | Equipo | [[E07-Infraestructura]] asume Linux con Docker |
| Destino de la copia de seguridad externa (P-21) | Equipo / CAPL | Se define antes de la fase 5 |
| Respuestas del [[11-Cuestionario-CAPL]] | CAPL | Todo es valor configurable con un valor por defecto en [[E03-Reglas-de-Negocio]] |
| Códigos y líneas de emergencia | CAPL | Se maqueta con [[12-Codigos-de-Emergencia-Borrador]]; **no se publica** sin su aprobación |
| Mockups | Rol A | Los hace con [[N00-Normas-Inicio]]; B y C empiezan por lo que no depende de pantalla |

## Regla de cambio

Si al programar se descubre que algo de aquí está mal o falta, **se corrige la nota en el mismo PR** que el código. La especificación y el código no pueden contradecirse.
