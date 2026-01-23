import type { CreateMealInput } from "@/repositories/DTOs/meal.dtos"
import type { MealRepository } from "@/repositories/meal-repository"
import type { MenuRepository } from "@/repositories/menu-repository"
import { ResourceNotFoundError } from "@/utils/errors/resource-not-found-error"

export class CreateMealUseCase {
  constructor(
    private mealRepository: MealRepository,
    private menuRepository: MenuRepository
  ) { }

  async execute(data: CreateMealInput) {
    const menuExists = await this.menuRepository.findById(data.menuId)

    if (!menuExists) {
      throw new ResourceNotFoundError()
    }

    const meal = await this.mealRepository.create(data)

    return { meal }
  }
}
