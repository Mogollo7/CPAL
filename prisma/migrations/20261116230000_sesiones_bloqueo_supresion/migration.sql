-- Cerrar todas las sesiones, bloqueo por 15 ingresos fallidos en un día y lista de supresión de correos (S02, S04).
ALTER TABLE "Usuario" ADD COLUMN "sesionesDesde" TIMESTAMP(3),
ADD COLUMN "bloqueadaEn" TIMESTAMP(3);

CREATE TABLE "CorreoSuprimido" (
    "correo" TEXT NOT NULL,
    "motivo" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CorreoSuprimido_pkey" PRIMARY KEY ("correo")
);
