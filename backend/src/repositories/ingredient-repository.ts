import { type Ingrediente } from "@/generated/prisma/client"
import type { CreateIngredientInput } from "./DTOs/ingredient.dtos"


export interface IngredientRepository {
  create(dishId: string, ingredient: CreateIngredientInput): Promise<Ingrediente>
  update(dishId: string, ingredientId: string, data: CreateIngredientInput): Promise<Ingrediente | null>
  delete(dishId: string, ingredientId: string): void
}