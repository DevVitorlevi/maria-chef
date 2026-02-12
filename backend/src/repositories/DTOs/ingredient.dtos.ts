import type { CategoryOfIngredient } from "@/generated/prisma/enums";
import type { Decimal } from "@prisma/client/runtime/client";

export interface CreateIngredientInput {
  name: string
  quantify: number
  unit: string
  category: CategoryOfIngredient
}

export interface CreateIngredientOutput {
  ingredient: {
    id: string
    dishId: string
    name: string
    quantify: Decimal
    unit: string
    category: CategoryOfIngredient
  }
}
export interface UpdateIngredientParams {
  dishId: string,
  ingredientId: string
}
export interface UpdateIngredientInput {
  name: string
  quantify: number
  unit: string
  category: CategoryOfIngredient
}

export interface DeleteIngredientParams {
  dishId: string,
  ingredientId: string
}