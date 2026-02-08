import type {
  SuggestVariationsInput,
  VariationSuggestionsResponse
} from "@/repositories/DTOs/ai.dtos";
import type { MenuAiRepository } from "@/repositories/menu-ai-repository";
import type { MenuRepository } from "@/repositories/menu-repository";
import { ResourceNotFoundError } from "@/utils/errors/resource-not-found-error";

export class SuggestsVariationUseCase {
  constructor(
    private menuAIRepository: MenuAiRepository,
    private menuRepository: MenuRepository
  ) { }

  async execute(input: SuggestVariationsInput & { menuId: string }): Promise<VariationSuggestionsResponse> {
    const menu = await this.menuRepository.findById(input.menuId);

    if (!menu) {
      throw new ResourceNotFoundError();
    }

    let nomeDoPrato = input.pratoOriginal;

    const pratoEncontrado = menu.refeicoes
      .flatMap(refeicao => refeicao.pratos)
      .find(prato => prato.id === input.pratoOriginal);

    if (pratoEncontrado) {
      nomeDoPrato = pratoEncontrado.nome;
    }

    const response = await this.menuAIRepository.variations({
      pratoOriginal: nomeDoPrato,
      contexto: {
        tipo: input.contexto.tipo,
        restricoes: menu.restricoes,
        preferencias: menu.preferencias ?? "",
      }
    });

    return response;
  }
}