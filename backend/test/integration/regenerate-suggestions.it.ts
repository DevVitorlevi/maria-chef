import { config } from "dotenv"
import { beforeEach, describe, expect, it } from "vitest"
import { TipoRefeicao } from "../../src/generated/prisma/enums"
import { prisma } from "../../src/lib/prisma"
import { PrismaMenuAIRepository } from "../../src/repositories/prisma/prisma-menu-ai-repository"
import { PrismaMenuRepository } from "../../src/repositories/prisma/prisma-menu-repository"
import { RegenarateSuggestionsUseCase } from "../../src/use-cases/menu-ai/regenerate-suggestions"

config()

describe("Menu AI Regenerate Integration", () => {
  let regenerateUseCase: RegenarateSuggestionsUseCase
  let menuRepository: PrismaMenuRepository
  let aiRepository: PrismaMenuAIRepository

  beforeEach(async () => {
    await prisma.refeicao.deleteMany()
    await prisma.cardapio.deleteMany()

    menuRepository = new PrismaMenuRepository()
    aiRepository = new PrismaMenuAIRepository()
    regenerateUseCase = new RegenarateSuggestionsUseCase(aiRepository, menuRepository)
  })

  it("should force AI to avoid specific dishes using real database context", async () => {
    const menu = await menuRepository.create({
      title: "Regeneração Real",
      adults: 4,
      restricoes: [],
      preferencias: "Comida regional cearense",
      checkIn: new Date("2026-02-20"),
      checkOut: new Date("2026-02-25"),
    })

    const previousSuggestions = ["Baião de Dois", "Paçoca de Carne de Sol"]

    const result = await regenerateUseCase.execute(
      { menuId: menu.id },
      {
        type: TipoRefeicao.ALMOCO,
        date: new Date("2026-02-21"),
        previousSuggestions
      }
    )

    const names = result.dishes.map(d => d.nome.toLowerCase())
    const hasRepeated = names.some(name =>
      previousSuggestions.map(p => p.toLowerCase()).includes(name)
    )

    expect(hasRepeated).toBe(false)
  }, 60000)
})