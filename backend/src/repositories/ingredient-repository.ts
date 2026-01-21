import { type Ingrediente } from "@/generated/prisma/client"
import type { CreateIngredientInput, UpdateIngredientInput, UpdateIngredientParams } from "./DTOs/ingredient.dtos"

export interface IngredientRepository {
  create(dishId: string, ingredient: CreateIngredientInput): Promise<Ingrediente>
  update(params: UpdateIngredientParams, data: UpdateIngredientInput): void
  delete(dishId: string, ingredientId: string): void
}