import type { TipoRefeicao } from "@/generated/prisma/enums"
import type {
  DishSuggestions,
  SuggestDishesInput,
  SuggestDishesParams,
} from "@/repositories/DTOs/ai.dtos"
import type { MenuAiRepository } from "@/repositories/menu-ai-repository"

export class InMemoryMenuAiRepository implements MenuAiRepository {
  async suggests(
    _params: SuggestDishesParams,
    data: SuggestDishesInput
  ): Promise<DishSuggestions> {
    const mockSuggestions: Record<TipoRefeicao, string[]> = {
      CAFE: [
        "Tapioca de queijo vegano",
        "Salada de frutas tropicais",
        "Café coado",
        "Suco de laranja natural",
        "Pão de queijo sem lactose",
        "Ovos mexidos",
      ],
      ALMOCO: [
        "Salada verde",
        "Arroz branco",
        "Feijão preto",
        "Peixe grelhado",
        "Farofa",
        "Banana frita",
        "Pudim de leite condensado",
      ],
      JANTAR: [
        "Sopa de legumes",
        "Pão integral",
        "Queijo minas",
        "Frutas variadas",
      ],
    }

    let suggestions = [...mockSuggestions[data.type]]

    if (data.context.restricoes.includes("sem_lactose")) {
      suggestions = suggestions.filter(
        s => !s.toLowerCase().includes("queijo") || s.includes("vegano")
      )
    }

    if (data.context.restricoes.includes("vegetariano")) {
      suggestions = suggestions.filter(
        s => !s.toLowerCase().includes("peixe")
      )
    }

    if (data.context.restricoes.includes("sem_gluten")) {
      suggestions = suggestions.filter(
        s => !s.toLowerCase().includes("pão")
      )
    }

    const pratosExistentes = data.refeicoes.flatMap(r =>
      r.pratos.map(p => p.nome.toLowerCase())
    )

    suggestions = suggestions.filter(
      s => !pratosExistentes.includes(s.toLowerCase())
    )

    const context: DishSuggestions["context"] = {
      menu: data.context.title,
      type: data.type,
      people: {
        adults: data.context.adults,
        kids: data.context.kids,
        total: data.context.adults + data.context.kids,
      },
      restricoes: data.context.restricoes,
      ...(data.context.preferencias && {
        preferencias: data.context.preferencias,
      }),
      ...(data.date && { date: data.date }),
    }

    return {
      suggestions,
      context,
      notes: `Sugestões mockadas para ${data.type}. Total de pessoas: ${data.context.adults + data.context.kids
        }`,
    }
  }
}
