import type { Meal } from "@/@types/menu"
import type { TipoRefeicao } from "@/generated/prisma/enums"
import type {
  DishSuggestions,
  MenuContext,
  SuggestDishesInput,
} from "@/repositories/DTOs/ai.dtos"
import type { MenuAiRepository } from "@/repositories/menu-ai-repository"

export class InMemoryMenuAiRepository implements MenuAiRepository {
  async suggests(data: SuggestDishesInput, context: MenuContext, meals: Meal[]): Promise<DishSuggestions> {
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

    if (context.restricoes.includes("sem_lactose")) {
      suggestions = suggestions.filter(
        s => !s.toLowerCase().includes("queijo") || s.includes("vegano")
      )
    }

    if (context.restricoes.includes("vegetariano")) {
      suggestions = suggestions.filter(
        s => !s.toLowerCase().includes("peixe")
      )
    }

    if (context.restricoes.includes("sem_gluten")) {
      suggestions = suggestions.filter(
        s => !s.toLowerCase().includes("pão")
      )
    }

    const pratosExistentes = meals.flatMap(meal =>
      meal.pratos.map(prato => prato.nome.toLowerCase())
    )

    suggestions = suggestions.filter(
      s => !pratosExistentes.includes(s.toLowerCase())
    )

    return {
      suggestions,
      context:
      {
        menu: context.title,
        type: data.type,
        people: {
          adults: context.adults,
          kids: context.kids,
          total: context.adults + context.kids,
        },
        restricoes: context.restricoes,
        ...(context.preferencias && {
          preferencias: context.preferencias,
        }),
        ...(data.date && { date: data.date }),
      },
      notes: `Sugestões mockadas para ${data.type}. Total de pessoas: ${context.adults + context.kids
        }`,
    }
  }
}
