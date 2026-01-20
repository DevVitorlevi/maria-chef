import type { CategoriaPrato } from "@/generated/prisma/enums";

export interface CreateDishInput {
  nome: string;
  categoria: CategoriaPrato;
}

export interface CreateDishOutput {
  dish: {
    id: string
    nome: string;
    categoria: CategoriaPrato;
    createdAt: Date
  }
}

export interface FindAllDishesFiltersInput {
  nome?: string | undefined
  categoria?: CategoriaPrato | undefined
}

export interface FindAllDishesOutput {
  dishes:
  {
    id: string
    nome: string;
    categoria: CategoriaPrato;
    createdAt: Date
  }[]
}