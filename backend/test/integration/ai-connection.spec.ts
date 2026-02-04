import { TipoRefeicao } from "../../src/generated/prisma/enums"
import { PrismaMenuAIRepository } from "../../src/repositories/prisma/prisma-menu-ai-repository"
import { config } from "dotenv"
import { describe, expect, it } from "vitest"

config()

describe("Gemini API Real Integration Test", () => {
  it("should generate creative and contextual suggestions avoiding repetitions", async () => {
    const repository = new PrismaMenuAIRepository()

    const menuContext = {
      id: 'real-test-menu-id',
      title: 'Férias de Verão - Icapuí',
      adults: 6,
      kids: 3,
      restricoes: ['Alérgicos a camarão', 'Restrição a pimenta para as crianças'],
      preferencias: 'Gostamos de comidas regionais cearenses e pratos assados.',
      checkin: new Date('2026-02-01'),
      checkout: new Date('2026-02-10'),
    }

    const existingMeals = [
      {
        id: 'meal-1',
        data: new Date('2026-02-01'),
        tipo: TipoRefeicao.ALMOCO,
        pratos: [
          { id: 'p1', nome: 'Feijoada Completa', categoria: 'ALMOCO' },
          { id: 'p2', nome: 'Pizza', categoria: 'LANCHE' }
        ]
      },
      {
        id: 'meal-2',
        data: new Date('2026-02-02'),
        tipo: TipoRefeicao.JANTAR,
        pratos: [
          { id: 'p3', nome: 'Espaguete à Bolonhesa', categoria: 'JANTAR' }
        ]
      }
    ]

    const input = {
      type: TipoRefeicao.ALMOCO,
      date: new Date('2026-02-03')
    }

    console.log("🚀 Enviando contexto real para o Gemini...")

    const result = await repository.suggests(input, menuContext, existingMeals as any)


    expect(result.suggestions).toBeInstanceOf(Array)
    expect(result.suggestions.length).toBeGreaterThanOrEqual(3)

    const suggestionsString = result.suggestions.join(" ").toLowerCase()
    expect(suggestionsString).not.toContain("camarão")
    expect(suggestionsString).not.toContain("pimenta")

    expect(suggestionsString).not.toContain("feijoada")

  }, 35000)
})