import type { Ingrediente, Prato, Prisma } from "@/generated/prisma/client";
import type { CreateDishInput, FindAllDishesFiltersInput, FindByIdDishParams } from "./DTOs/dish.dtos";
export type DishWithIngredients = Prato & {
  ingredientes: Ingrediente[];
}
export interface DishRepository {
  create(data: CreateDishInput): Promise<Prato>;
  findAll(params?: FindAllDishesFiltersInput): Promise<Prato[]>
  findById(dishId: FindByIdDishParams): Promise<DishWithIngredients | null>
  update(
    id: string,
    data: Prisma.PratoUpdateInput
  ): Promise<Prato>
  duplicate(id: string, data: Prisma.PratoUpdateInput): Promise<DishWithIngredients>
  delete(id: string): void
}