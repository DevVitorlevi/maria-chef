import type { UpdateMealInput, UpdateMealOutput, UpdateMealParams } from "@/repositories/DTOs/meal.dtos";
import type { MealRepository } from "@/repositories/meal-repository";
import type { MenuRepository } from "@/repositories/menu-repository";
import { ResourceNotFoundError } from "@/utils/errors/resource-not-found-error";

export class UpdateMealUseCase {
  constructor(
    private mealRepository: MealRepository,
    private menuRepository: MenuRepository
  ) { }

  async execute(params: UpdateMealParams, data?: UpdateMealInput): Promise<UpdateMealOutput> {
    const menuExist = await this.menuRepository.findById(params.menuId)

    if (!menuExist) {
      throw new ResourceNotFoundError()
    }

    const meal = await this.mealRepository.update(params, data)

    return meal
  }
}