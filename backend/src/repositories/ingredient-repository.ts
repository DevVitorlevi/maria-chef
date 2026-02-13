import type { CreateIngredientInput, CreateIngredientOutput, DeleteIngredientParams, UpdateIngredientInput, UpdateIngredientParams } from "./DTOs/ingredient.dtos"

export interface IngredientRepository {
  create(
    dishId: string,
    ingredient: CreateIngredientInput
  ): Promise<CreateIngredientOutput>
  update(
    params: UpdateIngredientParams,
    data: UpdateIngredientInput
  ): void
  delete(params: DeleteIngredientParams): void
}