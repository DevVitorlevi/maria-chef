import type { DishRepository } from "@/repositories/dish-repository"
import type { AcceptVariationInput, AcceptVariationParams } from "@/repositories/DTOs/ai.dtos"
import type { CreateIngredientInput } from "@/repositories/DTOs/ingredient.dtos"
import type { IngredientRepository } from "@/repositories/ingredient-repository"
import type { MealRepository } from "@/repositories/meal-repository"
import type { MenuRepository } from "@/repositories/menu-repository"
import { ResourceNotFoundError } from "@/utils/errors/resource-not-found-error"

export class AcceptVariationUseCase {
  constructor(
    private mealRepository: MealRepository,
    private menuRepository: MenuRepository,
    private dishRepository: DishRepository,
    private ingredientRepository: IngredientRepository
  ) { }

  async execute(input: AcceptVariationInput, params: AcceptVariationParams) {
    const menu = await this.menuRepository.findById(params.menuId)
    const result = await this.mealRepository.findById({
      id: params.mealId,
      menuId: params.menuId
    })

    if (!menu || !result || !result.meal) {
      throw new ResourceNotFoundError()
    }

    const meal = result.meal

    const newDish = await this.dishRepository.create({
      nome: input.sugestaoEscolhida.nome,
      categoria: input.sugestaoEscolhida.categoria,
    })

    if (!newDish || !newDish.id) {
      throw new Error("Falha ao criar o prato: ID não retornado.")
    }

    const ingredientPromises = input.sugestaoEscolhida.ingredientes.map((ing: CreateIngredientInput) =>
      this.ingredientRepository.create(newDish.id, ing)
    )
    await Promise.all(ingredientPromises)

    const updatedDishIds = meal.pratos
      .map((p) => p.id)
      .filter((id) => id !== params.oldPlateId)

    updatedDishIds.push(newDish.id)

    await this.mealRepository.update(
      { mealId: params.mealId, menuId: params.menuId },
      { dishes: updatedDishIds }
    )

    return { dish: newDish }
  }
}
