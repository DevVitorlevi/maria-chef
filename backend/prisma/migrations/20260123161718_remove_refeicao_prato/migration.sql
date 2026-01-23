/*
  Warnings:

  - You are about to drop the `refeicoes_pratos` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "refeicoes_pratos" DROP CONSTRAINT "refeicoes_pratos_prato_id_fkey";

-- DropForeignKey
ALTER TABLE "refeicoes_pratos" DROP CONSTRAINT "refeicoes_pratos_refeicao_id_fkey";

-- DropTable
DROP TABLE "refeicoes_pratos";

-- CreateTable
CREATE TABLE "_RefeicaoPratos" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_RefeicaoPratos_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_RefeicaoPratos_B_index" ON "_RefeicaoPratos"("B");

-- AddForeignKey
ALTER TABLE "_RefeicaoPratos" ADD CONSTRAINT "_RefeicaoPratos_A_fkey" FOREIGN KEY ("A") REFERENCES "pratos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RefeicaoPratos" ADD CONSTRAINT "_RefeicaoPratos_B_fkey" FOREIGN KEY ("B") REFERENCES "refeicoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
