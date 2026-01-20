/*
  Warnings:

  - You are about to drop the column `pratos` on the `refeicoes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "refeicoes" DROP COLUMN "pratos";

-- CreateTable
CREATE TABLE "refeicoes_pratos" (
    "id" TEXT NOT NULL,
    "refeicao_id" TEXT NOT NULL,
    "prato_id" TEXT NOT NULL,

    CONSTRAINT "refeicoes_pratos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "refeicoes_pratos_refeicao_id_prato_id_key" ON "refeicoes_pratos"("refeicao_id", "prato_id");

-- AddForeignKey
ALTER TABLE "refeicoes_pratos" ADD CONSTRAINT "refeicoes_pratos_refeicao_id_fkey" FOREIGN KEY ("refeicao_id") REFERENCES "refeicoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refeicoes_pratos" ADD CONSTRAINT "refeicoes_pratos_prato_id_fkey" FOREIGN KEY ("prato_id") REFERENCES "pratos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
