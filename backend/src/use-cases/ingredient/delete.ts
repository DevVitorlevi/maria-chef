import type { DishRepository } from "@/repositories/dish-repository";
import type { DeleteIngredientParams } from "@/repositories/DTOs/ingredient.dtos";
import type { IngredientRepository } from "@/repositories/ingredient-repository";
import { ResourceNotFoundError } from "@/utils/errors/resource-not-found-error";

export class DeleteIngredientUseCase {
  constructor(private ingredientRepository: IngredientRepository, private dishRepository: DishRepository) { }

  async execute({ dishId, ingredientId }: DeleteIngredientParams) {
    const dishExists = await this.dishRepository.findById({ dishId })

    if (!dishExists) {
      throw new ResourceNotFoundError()
    }

    await this.ingredientRepository.delete({ dishId, ingredientId })
  }
}