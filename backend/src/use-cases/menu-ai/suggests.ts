import type {
  DishSuggestions,
  MenuContext,
  SuggestDishesInput,
  SuggestDishesParams,
} from "@/repositories/DTOs/ai.dtos"
import type { MenuAiRepository } from "@/repositories/menu-ai-repository"
import type { MenuRepository } from "@/repositories/menu-repository"
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

    const context: MenuContext = {
      id: menu.id,
      title: menu.titulo,
      adults: menu.adultos,
      kids: menu.criancas,
      restricoes: menu.restricoes,
      preferencias: menu.preferencias ?? undefined,
      checkin: menu.checkin,
      checkout: menu.checkout,
    }

    const suggestions = await this.menuAIRepository.suggests(input, context, menu.refeicoes)

    return suggestions
  }
}