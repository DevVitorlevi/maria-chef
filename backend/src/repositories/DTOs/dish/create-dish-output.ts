import type { CategoriaPrato } from "@/generated/prisma/enums";

export interface CreateDishOutput {
  dish: {
    id: string
    nome: string;
    categoria: CategoriaPrato;
    createdAt: Date
  }
}