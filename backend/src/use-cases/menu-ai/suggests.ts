import type { Meal } from "@/@types/menu"
import type {
  DishSuggestions,
  MenuContext,
  SuggestDishesInput,
  SuggestDishesParams,
} from "@/repositories/DTOs/ai.dtos"
import type { MenuAiRepository } from "@/repositories/menu-ai-repository"
import type { MenuRepository } from "@/repositories/menu-repository"
import { InvalidDateError } from "@/utils/errors/invalid-date-error"
import { ResourceNotFoundError } from "@/utils/errors/resource-not-found-error"

export class MenuAiSuggestsUseCase {
  constructor(
    private menuRepository: MenuRepository,
    private menuAIRepository: MenuAiRepository,
  ) { }

  async execute(
    params: SuggestDishesParams,
    input: SuggestDishesInput,
  ): Promise<DishSuggestions> {
    const menu = await this.menuRepository.findById(params.menuId)

    if (!menu) {
      throw new ResourceNotFoundError()
    }

    const suggestionDate = new Date(input.date)
    if (suggestionDate < menu.checkin || suggestionDate > menu.checkout) {
      throw new InvalidDateError
    }

    const context: MenuContext = {
      id: menu.id,
      title: menu.titulo,
      adults: menu.adultos,
      kids: menu.criancas ?? 0,
      restricoes: menu.restricoes ?? [],
      preferencias: menu.preferencias ?? "",
      checkin: menu.checkin,
      checkout: menu.checkout,
    }

    const meals: Meal[] = menu.refeicoes ?? []
    const suggestions = await this.menuAIRepository.suggests(input, context, meals)

    return suggestions
  }
}