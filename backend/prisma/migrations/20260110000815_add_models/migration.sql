-- CreateEnum
CREATE TYPE "TipoRefeicao" AS ENUM ('CAFE', 'ALMOCO', 'JANTAR');

-- CreateEnum
CREATE TYPE "CategoriaPrato" AS ENUM ('CAFE_MANHA', 'ALMOCO', 'JANTAR', 'SOBREMESA', 'LANCHE');

-- CreateEnum
CREATE TYPE "CategoriaIngrediente" AS ENUM ('HORTIFRUTI', 'PROTEINA', 'LATICINIO', 'GRAOS', 'TEMPERO', 'BEBIDA', 'CONGELADO', 'PADARIA', 'HIGIENE', 'OUTROS');

-- CreateTable
CREATE TABLE "cardapios" (
    "id" TEXT NOT NULL,
    "titulo" VARCHAR(100) NOT NULL,
    "checkin" DATE NOT NULL,
    "checkout" DATE NOT NULL,
    "adultos" INTEGER NOT NULL,
    "criancas" INTEGER NOT NULL DEFAULT 0,
    "restricoes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "preferencias" VARCHAR(500),
    "gerado_por_ia" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cardapios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refeicoes" (
    "id" TEXT NOT NULL,
    "cardapio_id" TEXT NOT NULL,
    "data" DATE NOT NULL,
    "tipo" "TipoRefeicao" NOT NULL,
    "pratos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refeicoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pratos" (
    "id" TEXT NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "categoria" "CategoriaPrato" NOT NULL,
    "porcoes" INTEGER NOT NULL DEFAULT 1,
    "tempo_preparo" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pratos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingredientes" (
    "id" TEXT NOT NULL,
    "prato_id" TEXT NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "quantidade" DECIMAL(10,2) NOT NULL,
    "unidade" VARCHAR(20) NOT NULL,
    "categoria" "CategoriaIngrediente" NOT NULL,

    CONSTRAINT "ingredientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listas_compras" (
    "id" TEXT NOT NULL,
    "cardapio_id" TEXT NOT NULL,
    "itens" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "listas_compras_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cardapios_created_at_idx" ON "cardapios"("created_at" DESC);

-- CreateIndex
CREATE INDEX "cardapios_checkin_checkout_idx" ON "cardapios"("checkin", "checkout");

-- CreateIndex
CREATE INDEX "refeicoes_cardapio_id_data_idx" ON "refeicoes"("cardapio_id", "data");

-- CreateIndex
CREATE UNIQUE INDEX "refeicoes_cardapio_id_data_tipo_key" ON "refeicoes"("cardapio_id", "data", "tipo");

-- CreateIndex
CREATE UNIQUE INDEX "pratos_nome_key" ON "pratos"("nome");

-- CreateIndex
CREATE INDEX "pratos_categoria_idx" ON "pratos"("categoria");

-- CreateIndex
CREATE INDEX "ingredientes_prato_id_idx" ON "ingredientes"("prato_id");

-- CreateIndex
CREATE INDEX "ingredientes_categoria_idx" ON "ingredientes"("categoria");

-- CreateIndex
CREATE UNIQUE INDEX "listas_compras_cardapio_id_key" ON "listas_compras"("cardapio_id");

-- AddForeignKey
ALTER TABLE "refeicoes" ADD CONSTRAINT "refeicoes_cardapio_id_fkey" FOREIGN KEY ("cardapio_id") REFERENCES "cardapios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingredientes" ADD CONSTRAINT "ingredientes_prato_id_fkey" FOREIGN KEY ("prato_id") REFERENCES "pratos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listas_compras" ADD CONSTRAINT "listas_compras_cardapio_id_fkey" FOREIGN KEY ("cardapio_id") REFERENCES "cardapios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
