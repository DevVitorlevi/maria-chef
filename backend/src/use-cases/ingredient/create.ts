import type { DishRepository } from "@/repositories/dish-repository";
import type { CreateIngredientInput, CreateIngredientOutput } from "@/repositories/DTOs/ingredient.dtos";
import type { IngredientRepository } from "@/repositories/ingredient-repository";
import { ResourceNotFoundError } from "@/utils/errors/resource-not-found-error";

export class CreateIngredientUseCase {
  constructor(
    private ingredientRepository: IngredientRepository,
    private dishRepository: DishRepository
  ) { }

  async execute(dishId: string, data: CreateIngredientInput): Promise<CreateIngredientOutput> {
    const dishExists = await this.dishRepository.findById({ dishId })

    if (!dishExists) {
      throw new ResourceNotFoundError()
    }
    const ingredient = await this.ingredientRepository.create(dishId, data)

    return {
      ingredient
    }
  }
}