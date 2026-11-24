-- CreateEnum
CREATE TYPE "TipoEvento" AS ENUM ('TALLER', 'CHARLA', 'ENCUENTRO');

-- AlterTable
ALTER TABLE "Evento" ADD COLUMN "tipo" "TipoEvento" NOT NULL DEFAULT 'TALLER';

-- AlterTable
ALTER TABLE "Cita" ADD COLUMN "motivoCancelacion" TEXT;
