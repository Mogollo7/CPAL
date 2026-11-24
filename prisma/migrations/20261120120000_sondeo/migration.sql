-- CreateTable
CREATE TABLE "Sondeo" (
    "id" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ok" BOOLEAN NOT NULL,
    "ms" INTEGER NOT NULL,

    CONSTRAINT "Sondeo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Sondeo_creadoEn_idx" ON "Sondeo"("creadoEn");
