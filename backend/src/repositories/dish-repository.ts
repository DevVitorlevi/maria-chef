import type { Ingrediente, Prato } from "@/generated/prisma/client";
import type { CreateDishInput, FindAllDishesFiltersInput, FindByIdDishParams, UpdateDishInput, UpdateDishOutput } from "./DTOs/dish.dtos";

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
  ): Promise<UpdateDishOutput>
  duplicate(dishId: string): Promise<DishWithIngredients>
  delete(id: string): void
}