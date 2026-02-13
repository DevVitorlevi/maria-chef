import type { CreateDishInput, CreateDishOutput, DuplicateDishOutput, FindAllDishesFiltersInput, FindAllDishesOutput, FindByIdDishOutput, FindByIdDishParams, UpdateDishInput, UpdateDishOutput } from "./DTOs/dish.dtos";
export interface DishRepository {
  create(data: CreateDishInput): Promise<CreateDishOutput>;
  findAll(params?: FindAllDishesFiltersInput): Promise<FindAllDishesOutput>
  findById(dishId: FindByIdDishParams): Promise<FindByIdDishOutput | null>
  update(
    dishId: string,
    data: UpdateDishInput
  ): Promise<UpdateDishOutput>
  duplicate(dishId: string): Promise<DuplicateDishOutput>
  delete(id: string): void
}