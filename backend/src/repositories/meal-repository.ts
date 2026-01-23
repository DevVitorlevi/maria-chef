import type { Refeicao } from "@/generated/prisma/client";
import type { CreateMealInput } from "./DTOs/meal.dtos";

export interface MealRepository {
  create(data: CreateMealInput): Promise<Refeicao>
}