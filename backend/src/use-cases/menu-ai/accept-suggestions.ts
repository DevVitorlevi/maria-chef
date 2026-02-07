import type { CategoriaPrato } from "@/generated/prisma/enums"
import type { DishRepository } from "@/repositories/dish-repository"
import type { CreateMealFromSuggestionInput } from "@/repositories/DTOs/ai.dtos"
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
    private ingredientRepository: IngredientRepository,
  ) { }

  async execute(input: CreateMealFromSuggestionInput) {
    const menu = await this.menuRepository.findById(input.menuId)
    if (!menu) {
      throw new ResourceNotFoundError()
    }

    const mealDate = new Date(input.date)
    if (mealDate < new Date(menu.checkin) || mealDate > new Date(menu.checkout)) {
      throw new InvalidDateError()
    }

    const mealExists = menu.refeicoes?.find(
      (r: { data: string | number | Date; tipo: any }) => new Date(r.data).getTime() === mealDate.getTime() && r.tipo === input.type
    )
    if (mealExists) {
      throw new Error("Já existe uma refeição deste tipo nesta data.")
    }

    const createdDishIds: string[] = []

    const dishesToProcess = input.dishes ?? []

    for (const suggestion of dishesToProcess) {
      const dish = await this.dishRepository.create({
        nome: suggestion.nome,
        categoria: suggestion.categoria as CategoriaPrato,
      })

      createdDishIds.push(dish.id)

      for (const ingrediente of suggestion.ingredientes) {
        await this.ingredientRepository.create(dish.id, {
          nome: ingrediente.nome,
          quantidade: ingrediente.quantidade,
          unidade: ingrediente.unidade,
          categoria: ingrediente.categoria as any,
        })
      }
    }

    const meal = await this.mealRepository.create({
      menuId: input.menuId,
      date: input.date,
      type: input.type,
      dishes: createdDishIds,
    })

    const updatedMenu = await this.menuRepository.findById(input.menuId)

    return {
      menu: updatedMenu,
      meal,
      createdDishesCount: createdDishIds.length,
    }
  }
}