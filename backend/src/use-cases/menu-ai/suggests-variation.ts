import type {
  SuggestsVariationsParams,
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

  async execute(params: SuggestsVariationsParams, data: SuggestVariationsInput): Promise<VariationSuggestionsResponse> {
    const menu = await this.menuRepository.findById(params.menuId);

    if (!menu) {
      throw new ResourceNotFoundError();
    }

    let nomeDoPrato: string = params.pratoOriginal;

    const pratoEncontrado = menu.refeicoes
      .flatMap(refeicao => refeicao.pratos)
      .find(prato => prato.id === params.pratoOriginal);

    if (pratoEncontrado) {
      nomeDoPrato = pratoEncontrado.nome;
    }

    const variation = await this.menuAIRepository.variations(
      nomeDoPrato,
      {
        contexto: {
          tipo: data.contexto.tipo,
          restricoes: menu.restricoes,
          preferencias: menu.preferencias ?? "",
        }
      }
    );

    return variation;
  }
}