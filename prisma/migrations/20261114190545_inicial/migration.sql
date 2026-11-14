-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMIN', 'PSICOLOGO');

-- CreateEnum
CREATE TYPE "Area" AS ENUM ('PSICOLOGIA', 'NEUROPSICOLOGIA');

-- CreateEnum
CREATE TYPE "EstadoCita" AS ENUM ('PENDIENTE', 'AUTORIZADA', 'RECHAZADA', 'VENCIDA', 'CANCELADA', 'ATENDIDA', 'NO_ASISTIO');

-- CreateEnum
CREATE TYPE "ParaQuien" AS ENUM ('PROPIA', 'OTRA_PERSONA', 'MENOR');

-- CreateEnum
CREATE TYPE "TipoToken" AS ENUM ('INVITACION', 'RECUPERACION');

-- CreateEnum
CREATE TYPE "EstadoTrabajo" AS ENUM ('PENDIENTE', 'EN_CURSO', 'HECHO', 'FALLIDO');

-- CreateEnum
CREATE TYPE "TipoTrabajo" AS ENUM ('CORREO', 'CALENDARIO_PUBLICAR', 'CALENDARIO_BORRAR', 'WEBHOOK_RESEND');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "rol" "Rol" NOT NULL,
    "claveHash" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "ultimoIngreso" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TokenAcceso" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tipo" "TipoToken" NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "venceEn" TIMESTAMP(3) NOT NULL,
    "usadoEn" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TokenAcceso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerfilPsicologo" (
    "usuarioId" TEXT NOT NULL,
    "area" "Area" NOT NULL,
    "presentacion" TEXT NOT NULL DEFAULT '',
    "fotoRuta" TEXT,
    "visible" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PerfilPsicologo_pkey" PRIMARY KEY ("usuarioId")
);

-- CreateTable
CREATE TABLE "Servicio" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "duracionMin" INTEGER NOT NULL DEFAULT 60,
    "area" "Area" NOT NULL,
    "agendableEnLinea" BOOLEAN NOT NULL DEFAULT true,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Servicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Disponibilidad" (
    "id" TEXT NOT NULL,
    "psicologoId" TEXT NOT NULL,
    "diaSemana" INTEGER NOT NULL,
    "inicioMin" INTEGER NOT NULL,
    "finMin" INTEGER NOT NULL,

    CONSTRAINT "Disponibilidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bloqueo" (
    "id" TEXT NOT NULL,
    "psicologoId" TEXT,
    "desde" TIMESTAMP(3) NOT NULL,
    "hasta" TIMESTAMP(3) NOT NULL,
    "motivo" TEXT,
    "creadoPorId" TEXT NOT NULL,

    CONSTRAINT "Bloqueo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cita" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "servicioId" TEXT NOT NULL,
    "psicologoId" TEXT NOT NULL,
    "inicio" TIMESTAMP(3) NOT NULL,
    "fin" TIMESTAMP(3) NOT NULL,
    "estado" "EstadoCita" NOT NULL DEFAULT 'PENDIENTE',
    "paraQuien" "ParaQuien" NOT NULL,
    "solicitanteNombre" TEXT,
    "solicitanteCorreo" TEXT,
    "solicitanteTelefono" TEXT,
    "pacienteNombre" TEXT,
    "pacienteDocumento" TEXT,
    "pacienteEdad" INTEGER,
    "acudienteNombre" TEXT,
    "acudienteDocumento" TEXT,
    "motivo" TEXT,
    "calendarioEventoId" TEXT,
    "motivoRechazo" TEXT,
    "consentimientoEn" TIMESTAMP(3) NOT NULL,
    "consentimientoVersion" TEXT NOT NULL,
    "venceEn" TIMESTAMP(3),
    "recordatorioEn" TIMESTAMP(3),
    "reprogramadaDeId" TEXT,
    "reprogramaciones" INTEGER NOT NULL DEFAULT 0,
    "anonimizadaEn" TIMESTAMP(3),
    "creadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadaEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cita_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evento" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "inicio" TIMESTAMP(3) NOT NULL,
    "fin" TIMESTAMP(3),
    "lugar" TEXT NOT NULL,
    "enlace" TEXT,
    "imagenRuta" TEXT,
    "cupo" INTEGER,
    "soloComunidad" BOOLEAN NOT NULL DEFAULT false,
    "publicado" BOOLEAN NOT NULL DEFAULT false,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Evento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inscripcion" (
    "id" TEXT NOT NULL,
    "eventoId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "telefono" TEXT,
    "consentimientoEn" TIMESTAMP(3) NOT NULL,
    "creadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Inscripcion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Configuracion" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "autoAutorizar" BOOLEAN NOT NULL DEFAULT false,
    "anticipacionMinHoras" INTEGER NOT NULL DEFAULT 24,
    "anticipacionMaxDias" INTEGER NOT NULL DEFAULT 30,
    "cancelacionMinHoras" INTEGER NOT NULL DEFAULT 12,
    "maxCitasActivas" INTEGER NOT NULL DEFAULT 1,
    "maxReprogramaciones" INTEGER NOT NULL DEFAULT 2,
    "vencimientoPendienteHoras" INTEGER NOT NULL DEFAULT 48,
    "duracionEnlaceHoras" INTEGER NOT NULL DEFAULT 48,
    "conservacionMeses" INTEGER NOT NULL DEFAULT 12,
    "dominiosPermitidos" TEXT[],
    "correoAdministracion" TEXT NOT NULL,
    "versionPolitica" TEXT NOT NULL DEFAULT '1',

    CONSTRAINT "Configuracion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Auditoria" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT,
    "accion" TEXT NOT NULL,
    "entidad" TEXT NOT NULL,
    "entidadId" TEXT NOT NULL,
    "detalle" JSONB,
    "creadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trabajo" (
    "id" TEXT NOT NULL,
    "tipo" "TipoTrabajo" NOT NULL,
    "llave" TEXT NOT NULL,
    "datos" JSONB NOT NULL,
    "estado" "EstadoTrabajo" NOT NULL DEFAULT 'PENDIENTE',
    "intentos" INTEGER NOT NULL DEFAULT 0,
    "ultimoError" TEXT,
    "ejecutarDespuesDe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tomadoEn" TIMESTAMP(3),
    "hechoEn" TIMESTAMP(3),
    "entregado" BOOLEAN,
    "citaId" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Trabajo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodigoAcceso" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "codigoHash" TEXT NOT NULL,
    "venceEn" TIMESTAMP(3) NOT NULL,
    "intentos" INTEGER NOT NULL DEFAULT 0,
    "usadoEn" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CodigoAcceso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DispositivoConfiable" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "venceEn" TIMESTAMP(3) NOT NULL,
    "navegador" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DispositivoConfiable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PerfilPsicologoToServicio" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PerfilPsicologoToServicio_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_correo_key" ON "Usuario"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "TokenAcceso_tokenHash_key" ON "TokenAcceso"("tokenHash");

-- CreateIndex
CREATE INDEX "TokenAcceso_usuarioId_idx" ON "TokenAcceso"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Servicio_slug_key" ON "Servicio"("slug");

-- CreateIndex
CREATE INDEX "Disponibilidad_psicologoId_diaSemana_idx" ON "Disponibilidad"("psicologoId", "diaSemana");

-- CreateIndex
CREATE INDEX "Bloqueo_desde_hasta_idx" ON "Bloqueo"("desde", "hasta");

-- CreateIndex
CREATE UNIQUE INDEX "Cita_codigo_key" ON "Cita"("codigo");

-- CreateIndex
CREATE INDEX "Cita_estado_inicio_idx" ON "Cita"("estado", "inicio");

-- CreateIndex
CREATE INDEX "Cita_psicologoId_inicio_idx" ON "Cita"("psicologoId", "inicio");

-- CreateIndex
CREATE INDEX "Cita_solicitanteCorreo_idx" ON "Cita"("solicitanteCorreo");

-- CreateIndex
CREATE INDEX "Cita_pacienteDocumento_idx" ON "Cita"("pacienteDocumento");

-- CreateIndex
CREATE UNIQUE INDEX "Evento_slug_key" ON "Evento"("slug");

-- CreateIndex
CREATE INDEX "Evento_publicado_inicio_idx" ON "Evento"("publicado", "inicio");

-- CreateIndex
CREATE UNIQUE INDEX "Inscripcion_eventoId_correo_key" ON "Inscripcion"("eventoId", "correo");

-- CreateIndex
CREATE INDEX "Auditoria_entidad_entidadId_idx" ON "Auditoria"("entidad", "entidadId");

-- CreateIndex
CREATE UNIQUE INDEX "Trabajo_llave_key" ON "Trabajo"("llave");

-- CreateIndex
CREATE INDEX "Trabajo_estado_ejecutarDespuesDe_idx" ON "Trabajo"("estado", "ejecutarDespuesDe");

-- CreateIndex
CREATE INDEX "Trabajo_citaId_idx" ON "Trabajo"("citaId");

-- CreateIndex
CREATE INDEX "CodigoAcceso_usuarioId_idx" ON "CodigoAcceso"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "DispositivoConfiable_tokenHash_key" ON "DispositivoConfiable"("tokenHash");

-- CreateIndex
CREATE INDEX "DispositivoConfiable_usuarioId_idx" ON "DispositivoConfiable"("usuarioId");

-- CreateIndex
CREATE INDEX "_PerfilPsicologoToServicio_B_index" ON "_PerfilPsicologoToServicio"("B");

-- AddForeignKey
ALTER TABLE "TokenAcceso" ADD CONSTRAINT "TokenAcceso_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerfilPsicologo" ADD CONSTRAINT "PerfilPsicologo_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Disponibilidad" ADD CONSTRAINT "Disponibilidad_psicologoId_fkey" FOREIGN KEY ("psicologoId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bloqueo" ADD CONSTRAINT "Bloqueo_psicologoId_fkey" FOREIGN KEY ("psicologoId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cita" ADD CONSTRAINT "Cita_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "Servicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cita" ADD CONSTRAINT "Cita_psicologoId_fkey" FOREIGN KEY ("psicologoId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inscripcion" ADD CONSTRAINT "Inscripcion_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PerfilPsicologoToServicio" ADD CONSTRAINT "_PerfilPsicologoToServicio_A_fkey" FOREIGN KEY ("A") REFERENCES "PerfilPsicologo"("usuarioId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PerfilPsicologoToServicio" ADD CONSTRAINT "_PerfilPsicologoToServicio_B_fkey" FOREIGN KEY ("B") REFERENCES "Servicio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ── Restricciones que Prisma no expresa (E02 «Restricciones que van en SQL») ──
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Impide la doble reserva: dos citas activas del mismo psicólogo no pueden cruzarse (RNF-DAT-01).
ALTER TABLE "Cita" ADD CONSTRAINT cita_sin_cruce
  EXCLUDE USING gist (
    "psicologoId" WITH =,
    tsrange("inicio", "fin", '[)') WITH &&
  ) WHERE (estado IN ('PENDIENTE', 'AUTORIZADA'));

ALTER TABLE "Disponibilidad" ADD CONSTRAINT disponibilidad_bloque_valido
  CHECK ("finMin" > "inicioMin" AND "inicioMin" >= 0 AND "finMin" <= 1440);
ALTER TABLE "Disponibilidad" ADD CONSTRAINT disponibilidad_dia_valido
  CHECK ("diaSemana" BETWEEN 1 AND 7);
ALTER TABLE "Cita" ADD CONSTRAINT cita_fin_posterior CHECK ("fin" > "inicio");
ALTER TABLE "Bloqueo" ADD CONSTRAINT bloqueo_hasta_posterior CHECK ("hasta" > "desde");
ALTER TABLE "Configuracion" ADD CONSTRAINT configuracion_fila_unica CHECK ("id" = 1);
