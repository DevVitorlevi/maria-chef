import type { DishRepository } from "@/repositories/dish-repository";
import type { UpdateIngredientInput, UpdateIngredientParams } from "@/repositories/DTOs/ingredient.dtos";
import type { IngredientRepository } from "@/repositories/ingredient-repository";
import { ResourceNotFoundError } from "@/utils/errors/resource-not-found-error";

export class UpdateIngredientUseCase {
  constructor(private ingredientRepository: IngredientRepository, private dishRepository: DishRepository) { }

  async execute({ dishId, ingredientId }: UpdateIngredientParams, { nome, quantidade, unidade, categoria }: UpdateIngredientInput) {
    const dishExists = await this.dishRepository.findById({ dishId })

    if (!dishExists) {
      throw new ResourceNotFoundError()
    }

    const ingredient = await this.ingredientRepository.update(
      { ingredientId, dishId },
      { nome, quantidade, unidade, categoria }
    )

    return {
      ingredient
    }
  }
}