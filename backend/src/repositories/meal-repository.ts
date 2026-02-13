import type { CreateMealInput, CreatMealOutput, DeleteMealsParams, FindByIdMealOutput, FindByIdMealParams, UpdateMealInput, UpdateMealOutput, UpdateMealParams } from "./DTOs/meal.dtos";

export interface MealRepository {
  create(data: CreateMealInput): Promise<CreatMealOutput>
  findById(params: FindByIdMealParams): Promise<FindByIdMealOutput | null>
  update(params: UpdateMealParams, data?: UpdateMealInput): Promise<UpdateMealOutput>
  delete(params: DeleteMealsParams): void
}