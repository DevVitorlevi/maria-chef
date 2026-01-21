import type { Ingrediente, Prato } from "@/generated/prisma/client";
import type { CreateDishInput, DuplicateDishInput, FindAllDishesFiltersInput, FindByIdDishParams, UpdateDishInput } from "./DTOs/dish.dtos";

export type DishWithIngredients = Prato & {
  ingredientes: Ingrediente[];
}
export interface DishRepository {
  create(data: CreateDishInput): Promise<Prato>;
  findAll(params?: FindAllDishesFiltersInput): Promise<Prato[]>
  findById(dishId: FindByIdDishParams): Promise<DishWithIngredients | null>
  update(
    dishId: string,
    data: UpdateDishInput
  ): void
  duplicate(dishId: string, data?: DuplicateDishInput): Promise<DishWithIngredients>
  delete(id: string): void
}