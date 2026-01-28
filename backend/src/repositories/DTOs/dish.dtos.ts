import type { CategoriaIngrediente, CategoriaPrato } from "@/generated/prisma/enums";
import type { Decimal } from "@prisma/client/runtime/client";
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
export interface FindByIdDishParams {
  dishId: string
}
export interface FindByIdDishOutput {
  dish: {
    id: string
    nome: string
    categoria: CategoriaPrato
    createdAt: Date
    ingredientes: {
      id: string
      pratoId: string
      nome: string
      quantidade: Decimal
      unidade: string
      categoria: CategoriaIngrediente
    }[]
  }
}
export interface UpdateDishInput {
  nome?: string;
  categoria?: CategoriaPrato;
}
export interface UpdateDishOutput {
  dish: {
    id: string
    nome: string
    categoria: CategoriaPrato
    createdAt: Date
    ingredientes: {
      id: string
      pratoId: string
      nome: string
      quantidade: Decimal
      unidade: string
      categoria: CategoriaIngrediente
    }[]
  }
}
export interface DuplicateDishParams {
  dishId: string
}

export interface DuplicateDishInput {
  nome: string
  categoria: CategoriaPrato
  createdAt: Date
  ingredientes: {
    nome: string
    quantidade: Decimal
    unidade: string
    categoria: CategoriaIngrediente
  }
}

export interface DuplicateDishOutput {
  dish: {
    id: string
    nome: string
    categoria: CategoriaPrato
    createdAt: Date
    ingredientes: {
      id: string
      pratoId: string
      nome: string
      quantidade: Decimal
      unidade: string
      categoria: CategoriaIngrediente
    }[]
  }
}

export interface DeleteDishParams {
  id: string
}

