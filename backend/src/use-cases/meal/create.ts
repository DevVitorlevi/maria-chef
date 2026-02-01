import type { Menu } from "@/@types/menu"
import type { CreateMealInput } from "@/repositories/DTOs/meal.dtos"
import type { MealRepository } from "@/repositories/meal-repository"
import type { MenuRepository } from "@/repositories/menu-repository"
import { InvalidDateError } from "@/utils/errors/invalid-date-error"
import { ResourceNotFoundError } from "@/utils/errors/resource-not-found-error"

export class CreateMealUseCase {
  constructor(
    private mealRepository: MealRepository,
    private menuRepository: MenuRepository
  ) { }

  private validateDate(menu: Menu, data: CreateMealInput) {
    if (data.date < menu.checkin || data.date > menu.checkout) {
      throw new InvalidDateError()
    }
  }

  async execute(data: CreateMealInput) {
    const menuExist = await this.menuRepository.findById(data.menuId)

    if (!menuExist) {
      throw new ResourceNotFoundError()
    }

    this.validateDate(menuExist, data)

    const meal = await this.mealRepository.create(data)

    return { meal }
  }
}
