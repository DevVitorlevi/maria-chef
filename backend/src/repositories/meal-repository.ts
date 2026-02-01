import type { Refeicao } from "@/generated/prisma/client";
import type { CreateMealInput, DeleteMealsParams, UpdateMealInput, UpdateMealParams, UpdateMealOutput } from "./DTOs/meal.dtos";

export interface MealRepository {
  create(data: CreateMealInput): Promise<Refeicao>
  delete(params: DeleteMealsParams): void
  update(params: UpdateMealParams, data?: UpdateMealInput): Promise<UpdateMealOutput>
}