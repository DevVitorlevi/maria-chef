import type { DishRepository } from "@/repositories/dish-repository"
import type { AcceptSuggestionInput, AcceptSuggestionParams } from "@/repositories/DTOs/ai.dtos"
import type { IngredientRepository } from "@/repositories/ingredient-repository"
import type { MealRepository } from "@/repositories/meal-repository"
import type { MenuRepository } from "@/repositories/menu-repository"
import { InvalidDateError } from "@/utils/errors/invalid-date-error"
import { ResourceNotFoundError } from "@/utils/errors/resource-not-found-error"

export class AcceptMenuAISuggestionsUseCase {
  constructor(
    private menuRepository: MenuRepository,
    private mealRepository: MealRepository,
    private dishRepository: DishRepository,
    private ingredientRepository: IngredientRepository
  ) { }

  async execute(params: AcceptSuggestionParams, data: AcceptSuggestionInput) {
    const menu = await this.menuRepository.findById(params.menuId)

    if (!menu) {
      throw new ResourceNotFoundError()
    }

    const mealDate = new Date(data.date)
    const checkin = new Date(menu.checkin)
    const checkout = new Date(menu.checkout)

    mealDate.setHours(0, 0, 0, 0)
    checkin.setHours(0, 0, 0, 0)
    checkout.setHours(0, 0, 0, 0)

    if (mealDate < checkin || mealDate > checkout) {
      throw new InvalidDateError()
    }

    const createdDishIds: string[] = []

    for (const dishAI of data.dishes) {
      const dish = await this.dishRepository.create({
        nome: dishAI.nome,
        categoria: dishAI.categoria,
      })

      const ingredientPromises = dishAI.ingredientes.map(ing =>
        this.ingredientRepository.create(dish.id, ing)
      )
      await Promise.all(ingredientPromises)

      createdDishIds.push(dish.id)
    }

    const meal = await this.mealRepository.create({
      menuId: params.menuId,
      date: data.date,
      type: data.type,
      dishes: createdDishIds,
    })

    return { meal }
  }
}