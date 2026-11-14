---
tags: [capl, especificacion, flujos]
---

# E09 · Flujos de usuario

Volver a [[E00-Especificacion-Inicio]]. Cómo **debe** recorrer el sistema cada tipo de persona, con la ruta de cada paso. Rutas definidas en [[E04-Pantallas-y-Rutas]]; reglas en [[E03-Reglas-de-Negocio]].

## Enlaces de prueba

`{PRUEBAS}` es el dominio del entorno de pruebas (se fija en la tarea T-004). Cada ruta de esta nota se abre como `{PRUEBAS}` + ruta:

```
https://{PRUEBAS}/panel/admin/citas
```

Cuando el dominio exista, se reemplaza `{PRUEBAS}` en esta nota una sola vez y todos los enlaces quedan listos para tocar. Las cuentas de prueba (un administrador y cuatro psicólogos) las crea la semilla de [[E02-Modelo-de-Datos]]; sus claves están en el `README` del repositorio, nunca aquí.

---

## 1. Administrador

### Mapa general

```mermaid
flowchart TD
    A["Ingresar<br>/ingresar"] --> B{"¿Credenciales<br>correctas?"}
    B -- No --> A1["Mensaje genérico<br>5 intentos → espera"] --> A
    B -- Sí --> C["Bandeja de citas<br>/panel/admin/citas<br>abre en Pendientes"]

    C --> D["Detalle de cita<br>/panel/admin/citas/[id]"]
    C --> X["Exportar CSV"]
    C --> CAL["Calendario<br>/panel/admin/calendario"]

    C -.menú.-> P["Psicólogos<br>/panel/admin/psicologos"]
    C -.menú.-> E["Eventos<br>/panel/admin/eventos"]
    C -.menú.-> BL["Fechas bloqueadas<br>/panel/admin/bloqueos"]
    C -.menú.-> CF["Configuración<br>/panel/admin/configuracion"]

    P --> PN["Crear psicólogo<br>/panel/admin/psicologos/nuevo"]
    P --> PD["Detalle<br>/panel/admin/psicologos/[id]"]
    E --> EN["Crear evento<br>/panel/admin/eventos/nuevo"]
    E --> ED["Editar e inscritos<br>/panel/admin/eventos/[id]"]
```

### 1a. Autorizar una cita *(el flujo de todos los días)*

```mermaid
flowchart TD
    M["Llega correo<br>Nueva solicitud por revisar"] --> L["Botón del correo<br>/panel/admin/citas/[id]"]
    L --> S{"¿Hay sesión?"}
    S -- No --> I["/ingresar<br>y vuelve al detalle"] --> D
    S -- Sí --> D["Detalle de la cita<br>datos, horario, psicólogo, vence en"]

    D --> Q{"¿Qué decide?"}
    Q -- Autorizar --> AU["Estado: AUTORIZADA"]
    Q -- Rechazar --> MO["Escribe el motivo<br>(obligatorio)"] --> RE["Estado: RECHAZADA<br>el cupo se libera"]
    Q -- Nada en 48 h --> VE["Estado: VENCIDA<br>(automático)<br>el cupo se libera"]

    AU --> C1["Correo al paciente:<br>Tu cita ha sido autorizada + .ics"]
    AU --> C2["Correo al psicólogo:<br>Tienes una nueva cita"]
    RE --> C3["Correo al paciente:<br>No pudimos confirmar tu cita"]
    VE --> C3

    C1 --> B["Vuelve a la bandeja<br>/panel/admin/citas"]
    C3 --> B
```

| Paso | Ruta | Qué ve | Qué puede salir mal |
|------|------|--------|---------------------|
| 1 | Correo | Código, servicio, horario; sin datos del paciente | — |
| 2 | `/panel/admin/citas/[id]` | Todos los datos e historial | Sin sesión → pasa por `/ingresar` y regresa aquí |
| 3 | Mismo | Botones Autorizar y Rechazar | Otra persona ya la gestionó → aviso y se recarga |
| 4 | Mismo | Confirmación en pantalla; el estado cambia | La hora ya pasó → no deja autorizar |
| 5 | `/panel/admin/citas` | La cita ya no está en Pendientes | — |

Si **auto-autorización** está activa, este flujo no ocurre: la cita nace autorizada y administración solo recibe el aviso.

### 1b. Crear un psicólogo

```mermaid
flowchart TD
    A["/panel/admin/psicologos"] --> B["Crear psicólogo<br>/panel/admin/psicologos/nuevo"]
    B --> C["Nombre, correo institucional, área"]
    C --> D{"¿Correo válido?"}
    D -- "Dominio no permitido" --> C
    D -- "Ya existe" --> C
    D -- Sí --> E["Cuenta creada sin contraseña<br>Estado: Invitado"]
    E --> F["Correo: Te damos la bienvenida<br>enlace válido 48 h"]
    F --> G{"¿Crea su contraseña<br>a tiempo?"}
    G -- Sí --> H["Estado: Activo<br>completa perfil y horario"]
    G -- No --> R["Reenviar invitación<br>/panel/admin/psicologos/[id]"] --> F
    H --> I["Aparece con cupos<br>en /pedir-cita"]
```

Un psicólogo solo ofrece cupos cuando está **activo**, tiene **servicios** marcados y tiene **horario** cargado. La lista muestra a quién le falta algo.

### 1c. Gestionar psicólogos, eventos y ajustes

```mermaid
flowchart LR
    subgraph Psicólogos
      P1["/panel/admin/psicologos/[id]"] --> P2["Editar"]
      P1 --> P3["Reenviar invitación"]
      P1 --> P4{"Desactivar"}
      P4 -- "Tiene citas futuras" --> P5["Lista las citas:<br>reasignar o cancelar primero"]
      P4 -- "Sin citas" --> P6["Inactivo<br>ya no ofrece cupos"]
    end
    subgraph Eventos
      E1["/panel/admin/eventos/nuevo"] --> E2["Guardar borrador"]
      E2 --> E3["Publicar"] --> E4["Visible en /eventos"]
      E4 --> E5["Ver inscritos<br>exportar CSV"]
    end
    subgraph Ajustes
      C1["/panel/admin/configuracion"] --> C2["Auto-autorizar<br>anticipación, límites"]
      B1["/panel/admin/bloqueos"] --> B2["Bloquear fechas<br>de todo el centro"]
    end
```

### Recorrido de prueba del administrador

Se sigue en orden en el entorno de pruebas al cerrar la fase 3a. Cada casilla es una verificación.

| # | Abrir | Hacer | Debe pasar |
|---|-------|-------|------------|
| 1 | `{PRUEBAS}/ingresar` | Entrar con el administrador de prueba | Llega a `/panel/admin/citas` en "Pendientes" |
| 2 | `{PRUEBAS}/panel/admin/psicologos/nuevo` | Crear un psicólogo con un correo del equipo | Aparece como "Invitado"; llega el correo |
| 3 | Enlace del correo | Crear la contraseña | Entra al panel del psicólogo; el enlace deja de servir |
| 4 | `{PRUEBAS}/panel/psicologo/perfil` y `/horario` | Cargar foto, servicios y horario | Guardado |
| 5 | `{PRUEBAS}/pedir-cita` (ventana privada) | Pedir una cita con ese psicólogo | Pantalla de confirmación; llegan dos correos |
| 6 | `{PRUEBAS}/panel/admin/citas` | Abrir la solicitud nueva | Se ven todos los datos |
| 7 | `{PRUEBAS}/panel/admin/citas/[id]` | Autorizar | Estado "Autorizada"; correos al paciente y al psicólogo |
| 8 | `{PRUEBAS}/pedir-cita` | Pedir otra y **rechazarla** con motivo | Correo con el motivo; el cupo vuelve a estar libre |
| 9 | `{PRUEBAS}/panel/admin/configuracion` | Activar auto-autorización y pedir otra cita | Nace autorizada |
| 10 | `{PRUEBAS}/panel/admin/bloqueos` | Bloquear un día | Ese día no ofrece cupos en `/pedir-cita` |
| 11 | `{PRUEBAS}/panel/admin/psicologos/[id]` | Intentar desactivar al psicólogo con citas | No deja; lista las citas |
| 12 | `{PRUEBAS}/panel/psicologo/citas` (con el psicólogo) | Abrir `/panel/admin/citas` | Recibe "sin permiso" |

---

## 2. Persona que pide una cita

```mermaid
flowchart TD
    I["Inicio /<br>o Servicios /servicios"] --> U{"¿Es urgente?"}
    U -- Sí --> AY["Ayuda inmediata<br>/ayuda-inmediata"]
    U -- No --> F1["Paso 1 · Servicio<br>/pedir-cita"]
    F1 --> F2["Paso 2 · ¿Para quién?"]
    F2 --> F3["Paso 3 · Psicólogo y horario"]
    F3 --> H{"¿Hay cupos?"}
    H -- No --> SC["Próxima fecha disponible<br>+ contactos del CAPL"]
    H -- Sí --> F4["Paso 4 · Datos"]
    F4 --> F5["Paso 5 · Revisar y aceptar<br>tratamiento de datos"]
    F5 --> EN{"Enviar"}
    EN -- "Cupo tomado por otra persona" --> F3
    EN -- "Ya tiene una cita activa" --> LI["Aviso + cómo gestionar<br>la cita existente"]
    EN -- OK --> CO["Solicitud recibida<br>/pedir-cita/confirmacion"]
    CO --> M1["Correo: está en proceso<br>de autorización"]
    M1 --> ES{"Administración"}
    ES -- Autoriza --> M2["Correo: autorizada + .ics"]
    ES -- Rechaza o vence --> M3["Correo: no pudimos confirmar<br>enlace a /pedir-cita"]
    M2 --> RC["Recordatorio 24 h antes"]
    RC --> AS["Asiste al CAPL"]
```

En todos los pasos está visible el botón "Necesito ayuda ahora" y se puede volver atrás sin perder lo escrito.

### Gestionar la cita desde el correo

```mermaid
flowchart TD
    M["Botón de cualquier correo<br>/cita/[token]"] --> V{"¿Enlace válido?"}
    V -- No --> X["Enlace no válido<br>+ contactos"]
    V -- Sí --> R["Resumen de la cita y su estado"]
    R --> P{"¿Aún a tiempo?<br>(12 h antes)"}
    P -- No --> N["Solo lectura<br>+ contactos del CAPL"]
    P -- Sí --> A{"¿Qué quiere?"}
    A -- Cancelar --> C["Confirmar"] --> C2["Estado: CANCELADA<br>correo de confirmación"]
    A -- Reprogramar --> S["Elegir nuevo horario"] --> S2{"¿Cupo libre?"}
    S2 -- No --> S
    S2 -- Sí --> S3["Cita anterior cancelada<br>cita nueva creada"]
    S3 --> S4["Vuelve al flujo<br>de autorización"]
```

### Recorrido de prueba de la persona

| # | Abrir | Hacer | Debe pasar |
|---|-------|-------|------------|
| 1 | `{PRUEBAS}/` desde un celular | Tocar "Pedir mi cita" | Llega al paso 1 |
| 2 | `{PRUEBAS}/pedir-cita` | Completar los 5 pasos | Menos de 3 minutos; confirmación con código |
| 3 | Mismo, paso 4 | Volver atrás y recargar la página | No se pierde lo escrito |
| 4 | Mismo | Pedir una segunda cita con el mismo correo | Aviso de que ya tiene una activa |
| 5 | Correo recibido | Abrir "Ver mi solicitud" | Resumen sin datos sensibles |
| 6 | `{PRUEBAS}/cita/[token]` | Reprogramar | Nueva cita; la anterior queda cancelada |
| 7 | Mismo | Cancelar | Estado cancelada; el cupo queda libre |
| 8 | Mismo, cambiando una letra del enlace | — | "Enlace no válido" |
| 9 | `{PRUEBAS}/ayuda-inmediata` en modo avión | — | Abre (tras la fase 5) |

---

## 3. Psicólogo en formación

```mermaid
flowchart TD
    M["Correo de invitación"] --> L["Crear contraseña<br>/crear-clave/[token]"]
    L --> V{"¿Enlace vigente?"}
    V -- "Vencido o ya usado" --> O["Pedir otro enlace<br>escribiendo el correo"] --> M
    V -- Sí --> C["Crea su contraseña<br>entra de una vez"]
    C --> AV["Aviso: completa tu perfil y horario"]
    AV --> PF["Mi perfil<br>/panel/psicologo/perfil<br>foto, presentación, servicios"]
    PF --> HO["Mi horario<br>/panel/psicologo/horario<br>bloques por día"]
    HO --> LI["Ya ofrece cupos"]
    LI --> CI["Mis citas<br>/panel/psicologo/citas"]
    CI --> D["Ve contacto del paciente<br>solo de sus citas"]
    HO -.ausencia.-> BQ["Bloquear día u hora"]
    CI -.menú.-> CU["Mi cuenta<br>/panel/psicologo/cuenta"]
```

Los ingresos siguientes entran por `/ingresar` y llegan directo a `/panel/psicologo/citas`. Si olvidó la contraseña: `/recuperar-clave`.

---

## 4. Persona que se inscribe a un evento

```mermaid
flowchart LR
    A["Eventos<br>/eventos"] --> B["Detalle<br>/eventos/[slug]"]
    B --> C{"¿Inscripción abierta?"}
    C -- "Cupo lleno o evento pasado" --> D["Aviso + otros eventos"]
    C -- Sí --> E["Nombre, correo, teléfono<br>aceptar tratamiento de datos"]
    E --> F{"Enviar"}
    F -- "Ya inscrito" --> G["Aviso amable"]
    F -- OK --> H["Confirmación en pantalla"]
    H --> I["Correo con la información<br>y archivo de calendario"]
```

---

## 5. Persona que necesita ayuda inmediata

```mermaid
flowchart TD
    X["Cualquier página"] --> B["Botón fijo<br>Necesito ayuda ahora"]
    B --> A["/ayuda-inmediata"]
    A --> T["Arriba: línea de emergencias<br>botón de llamada"]
    A --> O{"Orientador<br>3–4 preguntas"}
    O --> C["Tarjeta del código que aplica:<br>qué hacer + a quién llamar"]
    A --> L["Directorio de líneas<br>por tipo de situación"]
    C --> LL["Toca y llama"]
    L --> LL
    T --> LL
```

Este flujo no pide ningún dato, no requiere conexión tras la primera visita y **nunca** termina en un formulario.

---

## Reglas comunes a todos los flujos

| Regla | Detalle |
|-------|---------|
| Regresar | Todo paso permite volver sin perder datos |
| Sesión vencida | Lleva a `/ingresar` y devuelve a la página que se intentaba abrir |
| Sin permiso | Mensaje claro y enlace al inicio del panel propio |
| Error del sistema | Mensaje humano, botón de reintentar y contactos del CAPL |
| Fin de flujo | Siempre dice qué pasa después y cuándo |
