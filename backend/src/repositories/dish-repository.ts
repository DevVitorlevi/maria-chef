import type { Prisma, Prato, Ingrediente } from "@/generated/prisma/client";

export type DishWithIngredients = Prato & {
  ingredientes: Ingrediente[];
};

export interface DishRepository {
  create(data: Prisma.PratoCreateInput): Promise<DishWithIngredients>;
}