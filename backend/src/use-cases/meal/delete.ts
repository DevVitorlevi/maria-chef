import type { DeleteMealsParams } from "@/repositories/DTOs/meal.dtos";
import type { MealRepository } from "@/repositories/meal-repository";
import type { MenuRepository } from "@/repositories/menu-repository";
import { ResourceNotFoundError } from "@/utils/errors/resource-not-found-error";

export class DeleteMealUseCase {
  constructor(
    private mealRepository: MealRepository,
    private menuRepository: MenuRepository
  ) { }

  async execute(params: DeleteMealsParams) {
    const menuExist = await this.menuRepository.findById(params.menuId)

    if (!menuExist) {
      throw new ResourceNotFoundError()
    }

    return await this.mealRepository.delete(params)
  }
}