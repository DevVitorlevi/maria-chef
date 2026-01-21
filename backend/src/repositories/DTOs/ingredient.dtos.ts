import type { CategoriaIngrediente } from "@/generated/prisma/enums";
import type { Decimal } from "@prisma/client/runtime/client";

export interface CreateIngredientInput {
  nome: string
  quantidade: number
  unidade: string
  categoria: CategoriaIngrediente
}

export interface CreateIngredientOutput {
  ingredient: {
    id: string
    pratoId: string
    nome: string
    quantidade: Decimal
    unidade: string
    categoria: CategoriaIngrediente
  }
}
