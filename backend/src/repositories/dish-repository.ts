import type { CategoriaPrato, Ingrediente, Prato, Prisma } from "@/generated/prisma/client";
import type { CreateDishInput } from "./DTOs/dish/create-dish-input";

export type DishWithIngredients = Prato & {
  ingredientes: Ingrediente[];
};
interface FindAllByFilters {
  nome?: string | undefined
  categoria?: CategoriaPrato | undefined
}
export interface DishRepository {
  create(data: CreateDishInput): Promise<Prato>;
  findAll(params?: FindAllByFilters): Promise<Prato[]>
  findById(id: string): Promise<DishWithIngredients | null>
  update(
    id: string,
    data: Prisma.PratoUpdateInput
  ): Promise<Prato>
  duplicate(id: string, data: Prisma.PratoUpdateInput): Promise<DishWithIngredients>
  delete(id: string): void
}