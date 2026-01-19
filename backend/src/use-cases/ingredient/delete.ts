import type { DishRepository } from "@/repositories/dish-repository";
import type { IngredientRepository } from "@/repositories/ingredient-repository";
import { ResourceNotFoundError } from "@/utils/errors/resource-not-found-error";

interface DeleteIngredientUseCaseRequest {
  dishId: string
  ingredientId: string
}

export class DeleteIngredientUseCase {
  constructor(private ingredientRepository: IngredientRepository, private dishRepository: DishRepository) { }

  async execute({ dishId, ingredientId }: DeleteIngredientUseCaseRequest) {
    const dishExists = await this.dishRepository.findById(dishId)

    if (!dishExists) {
      throw new ResourceNotFoundError()
    }

    await this.ingredientRepository.delete(
      dishId,
      ingredientId,
    )
  }
}