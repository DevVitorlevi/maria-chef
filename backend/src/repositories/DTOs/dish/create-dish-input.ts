import type { CategoriaPrato } from "@/generated/prisma/enums";

export interface CreateDishInput {
  nome: string;
  categoria: CategoriaPrato;
}