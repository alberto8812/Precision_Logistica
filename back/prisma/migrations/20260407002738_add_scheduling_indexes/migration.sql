-- CreateTable
CREATE TABLE "sheuduling" (
    "id" TEXT NOT NULL,
    "driverName" TEXT NOT NULL,
    "plates" TEXT NOT NULL,
    "programingDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sheuduling_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sheuduling_plates_key" ON "sheuduling"("plates");

-- CreateIndex
CREATE INDEX "sheuduling_created_at_id_desc_idx" ON "sheuduling"("createdAt" DESC, "id" DESC);

-- CreateIndex
CREATE INDEX "sheuduling_created_at_id_asc_idx" ON "sheuduling"("createdAt" ASC, "id" ASC);
