import type {
  DishSuggestions,
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
    data: Omit<SuggestDishesInput, "refeicoes">,
  ): Promise<DishSuggestions> {
    const menu = await this.menuRepository.findById(params.menuId)

    if (!menu) {
      throw new ResourceNotFoundError()
    }

    const dishSuggestions = await this.menuAIRepository.suggests(
      { menuId: params.menuId },
      {
        type: data.type,
        context: data.context,
        ...(data.date && { date: data.date }),
        refeicoes: menu.refeicoes,
      },
    )

    return dishSuggestions
  }
}
