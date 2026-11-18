---
tags: [capl, especificacion, datos]
---

# E02 · Modelo de datos

Volver a [[E00-Especificacion-Inicio]]. Dueño: rol B. Es la referencia para escribir `prisma/schema.prisma`.

## Convenciones

- Identificadores: `cuid` de texto.
- Fechas: `DateTime` en UTC. Se muestran en `America/Bogota` (UTC−5, sin horario de verano).
- Correos: siempre guardados en minúsculas y sin espacios.
- Nada se borra físicamente salvo `Disponibilidad`, `Bloqueo` y eventos sin inscritos. Lo demás se desactiva o se anonimiza.

## Enumeraciones

| Enumeración | Valores |
|-------------|---------|
| `Rol` | `ADMIN`, `PSICOLOGO` |
| `Area` | `PSICOLOGIA`, `NEUROPSICOLOGIA` |
| `EstadoCita` | `PENDIENTE`, `AUTORIZADA`, `RECHAZADA`, `VENCIDA`, `CANCELADA`, `ATENDIDA`, `NO_ASISTIO` |
| `ParaQuien` | `PROPIA`, `OTRA_PERSONA`, `MENOR` |
| `TipoToken` | `INVITACION`, `RECUPERACION` |
| `EstadoTrabajo` | `PENDIENTE`, `EN_CURSO`, `HECHO`, `FALLIDO` |
| `TipoTrabajo` | `CORREO`, `CALENDARIO_PUBLICAR`, `CALENDARIO_BORRAR`, `WEBHOOK_RESEND` |

## Esquema

```prisma
model Usuario {
  id             String    @id @default(cuid())
  correo         String    @unique
  nombre         String
  rol            Rol
  claveHash      String?               // vacío hasta que crea su contraseña
  activo         Boolean   @default(true)
  ultimoIngreso  DateTime?
  creadoEn       DateTime  @default(now())

  perfil           PerfilPsicologo?
  tokens           TokenAcceso[]
  disponibilidades Disponibilidad[]
  bloqueos         Bloqueo[]
  citas            Cita[]
}

model TokenAcceso {
  id         String    @id @default(cuid())
  usuarioId  String
  tipo       TipoToken
  tokenHash  String    @unique        // SHA-256 del token; el token en claro solo viaja en el correo
  venceEn    DateTime
  usadoEn    DateTime?
  creadoEn   DateTime  @default(now())
  usuario    Usuario   @relation(fields: [usuarioId], references: [id])
  @@index([usuarioId])
}

model PerfilPsicologo {
  usuarioId     String   @id
  area          Area
  presentacion  String   @default("")   // máx. 600 caracteres
  fotoRuta      String?
  visible       Boolean  @default(false) // aparece en el directorio público
  servicios     Servicio[]               // qué servicios atiende
  usuario       Usuario  @relation(fields: [usuarioId], references: [id])
}

model Servicio {
  id                String  @id @default(cuid())
  slug              String  @unique
  nombre            String
  descripcion       String
  duracionMin       Int     @default(60)
  area              Area
  agendableEnLinea  Boolean @default(true)
  activo            Boolean @default(true)
  orden             Int     @default(0)
  psicologos        PerfilPsicologo[]
  citas             Cita[]
}

model Disponibilidad {
  id           String  @id @default(cuid())
  psicologoId  String
  diaSemana    Int               // 1 = lunes … 7 = domingo
  inicioMin    Int               // minutos desde medianoche, hora de Bogotá (480 = 8:00 a. m.)
  finMin       Int
  psicologo    Usuario @relation(fields: [psicologoId], references: [id])
  @@index([psicologoId, diaSemana])
}

model Bloqueo {
  id           String   @id @default(cuid())
  psicologoId  String?           // vacío = bloqueo de todo el centro
  desde        DateTime
  hasta        DateTime
  motivo       String?
  creadoPorId  String
  psicologo    Usuario? @relation(fields: [psicologoId], references: [id])
  @@index([desde, hasta])
}

model Cita {
  id            String     @id @default(cuid())
  codigo        String     @unique       // legible: CAPL-7K3F, para citarla por teléfono
  servicioId    String
  psicologoId   String
  inicio        DateTime
  fin           DateTime
  estado        EstadoCita @default(PENDIENTE)
  paraQuien     ParaQuien

  solicitanteNombre    String?           // quien llena el formulario y recibe los correos
  solicitanteCorreo    String?
  solicitanteTelefono  String?
  pacienteNombre       String?           // igual al solicitante si paraQuien = PROPIA
  pacienteDocumento    String?
  pacienteEdad         Int?
  acudienteNombre      String?           // obligatorios si paraQuien = MENOR
  acudienteDocumento   String?
  motivo               String?           // opcional, máx. 300 caracteres; se guarda CIFRADO (S03)

  calendarioEventoId      String?        // evento en el calendario compartido, si la integración está activa
  motivoRechazo           String?
  consentimientoEn        DateTime
  consentimientoVersion   String
  venceEn                 DateTime?      // solo mientras está PENDIENTE
  recordatorioEn          DateTime?      // cuándo se envió el recordatorio
  reprogramadaDeId        String?        // cita anterior, si viene de una reprogramación
  reprogramaciones        Int      @default(0)
  anonimizadaEn           DateTime?
  creadaEn                DateTime @default(now())
  actualizadaEn           DateTime @updatedAt

  servicio   Servicio @relation(fields: [servicioId], references: [id])
  psicologo  Usuario  @relation(fields: [psicologoId], references: [id])
  @@index([estado, inicio])
  @@index([psicologoId, inicio])
  @@index([solicitanteCorreo])
  @@index([pacienteDocumento])
}

model Evento {
  id            String   @id @default(cuid())
  slug          String   @unique
  titulo        String
  descripcion   String
  inicio        DateTime
  fin           DateTime?
  lugar         String                 // dirección o "Virtual"
  enlace        String?
  imagenRuta    String?
  cupo          Int?                   // vacío = sin límite
  soloComunidad Boolean  @default(false)
  publicado     Boolean  @default(false)
  creadoEn      DateTime @default(now())
  inscripciones Inscripcion[]
  @@index([publicado, inicio])
}

model Inscripcion {
  id                String   @id @default(cuid())
  eventoId          String
  nombre            String
  correo            String
  telefono          String?
  consentimientoEn  DateTime
  creadaEn          DateTime @default(now())
  evento            Evento   @relation(fields: [eventoId], references: [id])
  @@unique([eventoId, correo])
}

model Configuracion {
  id                         Int     @id @default(1)   // una sola fila
  autoAutorizar              Boolean @default(false)
  anticipacionMinHoras       Int     @default(24)
  anticipacionMaxDias        Int     @default(30)
  cancelacionMinHoras        Int     @default(12)
  maxCitasActivas            Int     @default(1)
  maxReprogramaciones        Int     @default(2)
  vencimientoPendienteHoras  Int     @default(48)
  duracionEnlaceHoras        Int     @default(48)
  conservacionMeses          Int     @default(12)
  dominiosPermitidos         String[]                  // vacío = cualquiera (solo en pruebas)
  correoAdministracion       String
  versionPolitica            String  @default("1")
}

model Auditoria {
  id         String   @id @default(cuid())
  usuarioId  String?            // vacío = sistema o persona sin cuenta
  accion     String             // CITA_AUTORIZADA, PSICOLOGO_CREADO, CONFIG_CAMBIADA…
  entidad    String
  entidadId  String
  detalle    Json?              // nunca datos personales
  creadaEn   DateTime @default(now())
  @@index([entidad, entidadId])
}

model Trabajo {                           // cola general — ver S05
  id                 String        @id @default(cuid())
  tipo               TipoTrabajo
  llave              String        @unique  // impide encolar dos veces lo mismo
  datos              Json                   // se vacía al terminar
  estado             EstadoTrabajo @default(PENDIENTE)
  intentos           Int           @default(0)
  ultimoError        String?                // código, sin datos personales
  ejecutarDespuesDe  DateTime      @default(now())
  tomadoEn           DateTime?
  hechoEn            DateTime?
  entregado          Boolean?               // correos: lo actualiza el aviso de Resend
  citaId             String?
  creadoEn           DateTime      @default(now())
  @@index([estado, ejecutarDespuesDe])
  @@index([citaId])
}

model CodigoAcceso {                      // segundo paso de ingreso de administradores — ver S02
  id          String   @id @default(cuid())
  usuarioId   String
  codigoHash  String
  venceEn     DateTime                     // 10 minutos
  intentos    Int      @default(0)         // máx. 5
  usadoEn     DateTime?
  creadoEn    DateTime @default(now())
  @@index([usuarioId])
}

model DispositivoConfiable {
  id          String   @id @default(cuid())
  usuarioId   String
  tokenHash   String   @unique             // el token vive en una cookie del navegador
  venceEn     DateTime                     // 30 días
  navegador   String                       // descripción corta, para el aviso de ingreso
  creadoEn    DateTime @default(now())
  @@index([usuarioId])
}
```

## Restricciones que van en SQL (migración manual)

Prisma no las expresa en el esquema; se añaden a mano en la primera migración.

| # | Restricción | Para qué |
|---|-------------|----------|
| 1 | `CREATE EXTENSION btree_gist` | Requisito de la siguiente |
| 2 | **Exclusión en `Cita`:** no pueden existir dos citas del mismo `psicologoId` cuyos rangos `[inicio, fin)` se crucen, mientras su estado sea `PENDIENTE` o `AUTORIZADA` | **Impide la doble reserva** (RNF-DAT-01), incluso con servicios de distinta duración |
| 3 | `CHECK (finMin > inicioMin AND inicioMin >= 0 AND finMin <= 1440)` en `Disponibilidad` | Bloques válidos |
| 4 | `CHECK (diaSemana BETWEEN 1 AND 7)` en `Disponibilidad` | — |
| 5 | `CHECK (fin > inicio)` en `Cita` y `CHECK (hasta > desde)` en `Bloqueo` | — |
| 6 | `CHECK (id = 1)` en `Configuracion` | Garantiza la fila única |

Forma de la restricción 2:

```sql
ALTER TABLE "Cita" ADD CONSTRAINT cita_sin_cruce
  EXCLUDE USING gist (
    "psicologoId" WITH =,
    tsrange("inicio", "fin", '[)') WITH &&
  ) WHERE (estado IN ('PENDIENTE', 'AUTORIZADA'));
```

Cuando la base de datos rechaza una inserción por esta restricción, el servidor responde `CUPO_OCUPADO` ([[E05-Operaciones-y-Contratos]]).

## Datos personales: dónde están y qué pasa con ellos

| Tabla | Datos personales | Al cumplirse `conservacionMeses` |
|-------|------------------|----------------------------------|
| `Cita` | Nombres, documento, correo, teléfono, edad, motivo | Se ponen en vacío y se marca `anonimizadaEn`; quedan servicio, psicólogo, fecha y estado para estadísticas |
| `Inscripcion` | Nombre, correo, teléfono | Se borra la fila |
| `Trabajo` | En `datos` | `datos` se vacía al terminar; la fila se borra a los 30 días |
| `CodigoAcceso`, `DispositivoConfiable` | Ninguno de pacientes | Se borran al vencer |
| `Usuario` | Nombre y correo institucional | Se conserva (personal del centro) |
| `Auditoria` | Ninguno | Se conserva |

## Semilla (datos de ejemplo)

`prisma/semilla.ts` deja el sistema listo para probar. **Ningún dato real.**

| Qué | Cantidad | Detalle |
|-----|----------|---------|
| Administrador | 1 | Correo de `ADMIN_INICIAL_CORREO`; en local, clave de prueba documentada en el README |
| Psicólogos | 4 | 3 de psicología, 1 de neuropsicología; uno sin horario, uno inactivo |
| Servicios | 6 | Los del sitio anterior; 3 agendables en línea |
| Disponibilidad | — | Siguiendo el horario publicado (lun, mar, vie mañana…) |
| Bloqueos | 2 | Uno de un psicólogo, uno de todo el centro |
| Citas | 12 | Al menos una en cada estado, fechas relativas a "hoy" |
| Eventos | 3 | Uno futuro con cupo, uno futuro sin cupo, uno pasado |
| Configuración | 1 | Valores por defecto |

En producción la semilla crea **solo** la fila de configuración, los servicios y el administrador inicial (sin clave: recibe su enlace).
