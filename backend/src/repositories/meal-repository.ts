import type { Refeicao } from "@/generated/prisma/client";
import type { CreateMealInput, DeleteMealsParams } from "./DTOs/meal.dtos";

export interface MealRepository {
  create(data: CreateMealInput): Promise<Refeicao>
  delete(params: DeleteMealsParams): void
}