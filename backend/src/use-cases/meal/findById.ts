import type { FindByIdMealOutput, FindByIdMealParams } from "@/repositories/DTOs/meal.dtos";
import type { MealRepository } from "@/repositories/meal-repository";
import type { MenuRepository } from "@/repositories/menu-repository";
import { ResourceNotFoundError } from "@/utils/errors/resource-not-found-error";

export class FindByIdMealUseCase {
  constructor(private mealRepository: MealRepository, private menuRepository: MenuRepository) { }

  async execute(params: FindByIdMealParams): Promise<FindByIdMealOutput> {
    const menuExist = await this.menuRepository.findById(params.menuId)

    if (!menuExist) {
      throw new ResourceNotFoundError()
    }

    const meal = await this.mealRepository.findById(params)

    if (!meal) {
      throw new ResourceNotFoundError()
    }

    return meal
  }
}