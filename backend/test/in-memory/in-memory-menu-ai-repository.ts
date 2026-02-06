import type { Meal } from "@/@types/menu"
import {
  TipoRefeicao,
} from "@/generated/prisma/enums"

import type {
  AISuggestedDish,
  DishSuggestions,
  MenuContext,
  SuggestDishesInput,
} from "@/repositories/DTOs/ai.dtos"

import type { MenuAiRepository } from "@/repositories/menu-ai-repository"

export class InMemoryMenuAiRepository implements MenuAiRepository {
  async suggests(
    data: SuggestDishesInput,
    context: MenuContext,
    meals: Meal[],
  ): Promise<DishSuggestions> {

    const kids = context.kids ?? 0
    const totalPeople = context.adults + kids

    const baseDishes: Record<TipoRefeicao, AISuggestedDish[]> = {
      CAFE: [
        {
          nome: "Tapioca de queijo vegano",
          categoria: "CAFE_MANHA",
          ingredientes: [
            { nome: "Goma de tapioca", quantidade: 100, unidade: "g", categoria: "OUTROS" },
            { nome: "Queijo vegano", quantidade: 50, unidade: "g", categoria: "LATICINIO" },
          ],
        },
        {
          nome: "Salada de frutas tropicais",
          categoria: "LANCHE",
          ingredientes: [
            { nome: "Manga", quantidade: 1, unidade: "un", categoria: "HORTIFRUTI" },
            { nome: "Abacaxi", quantidade: 100, unidade: "g", categoria: "HORTIFRUTI" },
          ],
        },
        {
          nome: "Café coado",
          categoria: "CAFE_MANHA",
          ingredientes: [
            { nome: "Café", quantidade: 20, unidade: "g", categoria: "OUTROS" },
            { nome: "Água", quantidade: 300, unidade: "ml", categoria: "OUTROS" },

          ],
        },
      ],

      ALMOCO: [
        {
          nome: "Arroz de Polvo",
          categoria: "ALMOCO",
          ingredientes: [
            { nome: "Arroz", quantidade: 200, unidade: "g", categoria: "GRAOS" },
            { nome: "Alho", quantidade: 5, unidade: "g", categoria: "TEMPERO" },
            { nome: "Polvo", quantidade: 1, unidade: "kg", categoria: "PROTEINA" }
          ],
        },
        {
          nome: "Peixe grelhado",
          categoria: "ALMOCO",
          ingredientes: [
            { nome: "Arroz", quantidade: 200, unidade: "g", categoria: "GRAOS" },
            { nome: "Filé de peixe", quantidade: 180, unidade: "g", categoria: "PROTEINA" },
            { nome: "Sal", quantidade: 2, unidade: "g", categoria: "TEMPERO" },
          ],
        }
      ],

      JANTAR: [
        {
          nome: "Sopa de HORTIFRUTIs",
          categoria: "JANTAR",
          ingredientes: [
            { nome: "Batata", quantidade: 150, unidade: "g", categoria: "HORTIFRUTI" },
            { nome: "Cenoura", quantidade: 80, unidade: "g", categoria: "HORTIFRUTI" },
          ],
        },
        {
          nome: "Pão integral",
          categoria: "SOBREMESA",
          ingredientes: [
            { nome: "Farinha integral", quantidade: 120, unidade: "g", categoria: "OUTROS" },
          ],
        },
      ],
    }

    let dishes = [...baseDishes[data.type]]


    if (context.restricoes.includes("sem_lactose")) {
      dishes = dishes.filter(d =>
        !d.nome.toLowerCase().includes("queijo") ||
        d.nome.toLowerCase().includes("vegano"),
      )
    }

    if (context.restricoes.includes("vegetariano")) {
      dishes = dishes.filter(d =>
        !d.nome.toLowerCase().includes("peixe"),
      )
    }

    if (context.restricoes.includes("sem_gluten")) {
      dishes = dishes.filter(d =>
        !d.nome.toLowerCase().includes("pão"),
      )
    }

    const existingNames = meals.flatMap(meal =>
      meal.pratos.map(p => p.nome.toLowerCase()),
    )

    dishes = dishes.filter(
      d => !existingNames.includes(d.nome.toLowerCase()),
    )

    return {

      dishes,

      context: {
        menu: context.title,
        type: data.type,
        date: data.date,

        people: {
          adults: context.adults,
          kids,
          total: totalPeople,
        },

        restricoes: context.restricoes,
        ...(context.preferencias && {
          preferencias: context.preferencias,
        }),
      },

      notes: `Sugestões mockadas estruturadas para ${data.type}. Pessoas: ${totalPeople}`,
    }
  }
}
