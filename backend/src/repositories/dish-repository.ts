import type { CategoriaPrato, Ingrediente, Prato, Prisma } from "@/generated/prisma/client";

export type DishWithIngredients = Prato & {
  ingredientes: Ingrediente[];
};
interface FindAllByFilters {
  nome?: string | undefined
  categoria?: CategoriaPrato | undefined
}
export interface DishRepository {
  create(data: Prisma.PratoCreateInput): Promise<DishWithIngredients>;
  findAll(params?: FindAllByFilters): Promise<Prato[]>
}