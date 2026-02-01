import type { Menu } from "@/@types/menu"
import type {
  UpdateMealInput,
  UpdateMealOutput,
  UpdateMealParams,
} from "@/repositories/DTOs/meal.dtos"
import type { MealRepository } from "@/repositories/meal-repository"
import type { MenuRepository } from "@/repositories/menu-repository"
import { InvalidDateError } from "@/utils/errors/invalid-date-error"
import { ResourceNotFoundError } from "@/utils/errors/resource-not-found-error"

export class UpdateMealUseCase {
  constructor(
    private readonly mealRepository: MealRepository,
    private readonly menuRepository: MenuRepository
  ) { }

  private validateDate(menu: Menu, data?: UpdateMealInput): void {
    if (!data?.date) return

    if (data.date < menu.checkin || data.date > menu.checkout) {
      throw new InvalidDateError()
    }
  }

  async execute(
    params: UpdateMealParams,
    data?: UpdateMealInput
  ): Promise<UpdateMealOutput> {
    const menu = await this.menuRepository.findById(params.menuId)

    if (!menu) {
      throw new ResourceNotFoundError()
    }

    this.validateDate(menu, data)

    return this.mealRepository.update(params, data)
  }
}
