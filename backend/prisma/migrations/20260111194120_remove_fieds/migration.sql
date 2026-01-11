/*
  Warnings:

  - You are about to drop the column `porcoes` on the `pratos` table. All the data in the column will be lost.
  - You are about to drop the column `tempo_preparo` on the `pratos` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "pratos" DROP COLUMN "porcoes",
DROP COLUMN "tempo_preparo";
