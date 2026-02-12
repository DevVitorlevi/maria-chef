/*
  Warnings:

  - You are about to drop the `_RefeicaoPratos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cardapios` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ingredientes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `listas_compras` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `pratos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `refeicoes` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TypeOfMeal" AS ENUM ('BREAKFAST', 'LUNCH', 'DESERT', 'SNACK', 'DINNER');

-- CreateEnum
CREATE TYPE "CategoryOfDish" AS ENUM ('BREAKFAST', 'LUNCH', 'DESERT', 'SNACK', 'DINNER');

-- CreateEnum
CREATE TYPE "CategoryOfIngredient" AS ENUM ('PRODUCE', 'PROTEIN', 'DAIRY', 'GRAIN', 'CEREAL', 'MASS', 'FARINACEUS', 'OIL', 'CANNED', 'SAUCES', 'MORNING', 'BAKING', 'TEMPERO', 'SNACKS', 'CANDY', 'OUTROS');

-- DropForeignKey
ALTER TABLE "_RefeicaoPratos" DROP CONSTRAINT "_RefeicaoPratos_A_fkey";

-- DropForeignKey
ALTER TABLE "_RefeicaoPratos" DROP CONSTRAINT "_RefeicaoPratos_B_fkey";

-- DropForeignKey
ALTER TABLE "ingredientes" DROP CONSTRAINT "ingredientes_prato_id_fkey";

-- DropForeignKey
ALTER TABLE "listas_compras" DROP CONSTRAINT "listas_compras_cardapio_id_fkey";

-- DropForeignKey
ALTER TABLE "refeicoes" DROP CONSTRAINT "refeicoes_cardapio_id_fkey";

-- DropTable
DROP TABLE "_RefeicaoPratos";

-- DropTable
DROP TABLE "cardapios";

-- DropTable
DROP TABLE "ingredientes";

-- DropTable
DROP TABLE "listas_compras";

-- DropTable
DROP TABLE "pratos";

-- DropTable
DROP TABLE "refeicoes";

-- DropEnum
DROP TYPE "CategoriaIngrediente";

-- DropEnum
DROP TYPE "CategoriaPrato";

-- DropEnum
DROP TYPE "TipoRefeicao";

-- CreateTable
CREATE TABLE "menus" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "checkin" DATE NOT NULL,
    "checkout" DATE NOT NULL,
    "adults" INTEGER NOT NULL,
    "child" INTEGER DEFAULT 0,
    "restrictions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "preferences" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meals" (
    "id" TEXT NOT NULL,
    "menu_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "type" "TypeOfMeal" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dishes" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "category" "CategoryOfDish" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dishes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingredients" (
    "id" TEXT NOT NULL,
    "dish_id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "quantify" DECIMAL(10,2) NOT NULL,
    "unit" VARCHAR(20) NOT NULL,
    "category" "CategoryOfIngredient" NOT NULL,

    CONSTRAINT "ingredients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shopping_list" (
    "id" TEXT NOT NULL,
    "menu_id" TEXT NOT NULL,
    "itens" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shopping_list_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MealDishes" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_MealDishes_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "menus_created_at_idx" ON "menus"("created_at" DESC);

-- CreateIndex
CREATE INDEX "menus_checkin_checkout_idx" ON "menus"("checkin", "checkout");

-- CreateIndex
CREATE INDEX "meals_menu_id_date_idx" ON "meals"("menu_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "meals_menu_id_date_type_key" ON "meals"("menu_id", "date", "type");

-- CreateIndex
CREATE UNIQUE INDEX "dishes_name_key" ON "dishes"("name");

-- CreateIndex
CREATE INDEX "dishes_category_idx" ON "dishes"("category");

-- CreateIndex
CREATE INDEX "ingredients_dish_id_idx" ON "ingredients"("dish_id");

-- CreateIndex
CREATE INDEX "ingredients_category_idx" ON "ingredients"("category");

-- CreateIndex
CREATE UNIQUE INDEX "shopping_list_menu_id_key" ON "shopping_list"("menu_id");

-- CreateIndex
CREATE INDEX "_MealDishes_B_index" ON "_MealDishes"("B");

-- AddForeignKey
ALTER TABLE "meals" ADD CONSTRAINT "meals_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "menus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_dish_id_fkey" FOREIGN KEY ("dish_id") REFERENCES "dishes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shopping_list" ADD CONSTRAINT "shopping_list_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "menus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MealDishes" ADD CONSTRAINT "_MealDishes_A_fkey" FOREIGN KEY ("A") REFERENCES "dishes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MealDishes" ADD CONSTRAINT "_MealDishes_B_fkey" FOREIGN KEY ("B") REFERENCES "meals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
