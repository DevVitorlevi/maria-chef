import type {
  DishSuggestions,
  RegenerateSuggestionsInput,
  RegenerateSuggestionsParams
} from "@/repositories/DTOs/ai.dtos";
import type { MenuAiRepository } from "@/repositories/menu-ai-repository";
import type { MenuRepository } from "@/repositories/menu-repository";
import { ResourceNotFoundError } from "@/utils/errors/resource-not-found-error";

export class RegenarateSuggestionsUseCase {
  constructor(
    private menuAIRepository: MenuAiRepository,
    private menuRepository: MenuRepository
  ) { }

  async execute(
    params: RegenerateSuggestionsParams,
    data: RegenerateSuggestionsInput
  ): Promise<DishSuggestions> {
    const menu = await this.menuRepository.findById(params.menuId);

    if (!menu) {
      throw new ResourceNotFoundError();
    }

    const context = {
      id: menu.id,
      title: menu.titulo,
      adults: menu.adultos,
      kids: menu.criancas,
      restricoes: menu.restricoes,
      preferencias: menu.preferencias,
      checkin: menu.checkin,
      checkout: menu.checkout,
    };

    const suggestions = await this.menuAIRepository.regenerate(
      data,
      context,
      menu.refeicoes
    );

    return suggestions;
  }
}