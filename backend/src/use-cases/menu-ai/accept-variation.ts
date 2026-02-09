import type { DishRepository } from "@/repositories/dish-repository"
import type { AcceptVariationInput, AcceptVariationParams } from "@/repositories/DTOs/ai.dtos"
import type { CreateIngredientInput } from "@/repositories/DTOs/ingredient.dtos"
import type { IngredientRepository } from "@/repositories/ingredient-repository"
import { MealRepository } from "@/repositories/meal-repository"
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

    const meal = await this.mealRepository.findById({
      id: params.mealId,
      menuId: params.menuId
    })

    if (!menu || !meal) {
      throw new ResourceNotFoundError()
    }

    const newDish = await this.dishRepository.create({
      nome: input.sugestaoEscolhida.nome,
      categoria: input.sugestaoEscolhida.categoria,
    })

    const ingredientPromises = input.sugestaoEscolhida.ingredientes.map((ing: CreateIngredientInput) =>
      this.ingredientRepository.create(newDish.id, ing)
    )

    await Promise.all(ingredientPromises)

    const updatedDishIds = meal.meal.pratos
      .map((p: { id: string }) => p.id)
      .filter((id: string) => id !== params.oldPlateId)

    updatedDishIds.push(newDish.id)

    await this.mealRepository.update(
      { mealId: params.mealId, menuId: params.menuId },
      { dishes: updatedDishIds }
    )

    return { dish: newDish }
  }
}