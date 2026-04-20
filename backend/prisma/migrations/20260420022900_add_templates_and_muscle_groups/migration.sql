-- AlterTable
ALTER TABLE "Exercise" ADD COLUMN     "grupoMuscular" TEXT,
ADD COLUMN     "musculoSecundario" TEXT;

-- CreateTable
CREATE TABLE "Template" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "creadorId" INTEGER NOT NULL,
    "publico" BOOLEAN NOT NULL DEFAULT false,
    "rutina" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Template" ADD CONSTRAINT "Template_creadorId_fkey" FOREIGN KEY ("creadorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
