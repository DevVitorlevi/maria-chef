import { beforeEach, describe, expect, it } from "vitest"
import { TipoRefeicao } from "../../../src/generated/prisma/enums"
import { RegenarateSuggestionsUseCase } from "../../../src/use-cases/menu-ai/regenerate-suggestions"
import { ResourceNotFoundError } from "../../../src/utils/errors/resource-not-found-error"
import { InMemoryMenuAiRepository } from "../../in-memory/in-memory-menu-ai-repository"
import { InMemoryMenuRepository } from "../../in-memory/in-memory-menu-repository"
let menuAiRepository: InMemoryMenuAiRepository
let menuRepository: InMemoryMenuRepository
let sut: RegenarateSuggestionsUseCase

describe("Regenerate Suggestions Use Case", () => {
  beforeEach(() => {
    menuAiRepository = new InMemoryMenuAiRepository()
    menuRepository = new InMemoryMenuRepository()
    sut = new RegenarateSuggestionsUseCase(menuAiRepository, menuRepository)
  })

  it("should be able to flow from initial suggestion to regeneration", async () => {
    const menu = await menuRepository.create({
      title: "Viagem Maria",
      adults: 2,
      kids: 0,
      restricoes: [],
      preferencias: "",
      checkin: new Date(),
      checkout: new Date(),
    })

    const context = {
      id: menu.id,
      title: menu.title,
      adults: menu.adults,
      kids: menu.kids,
      restricoes: menu.restricoes,
      preferencias: menu.preferencias,
      checkin: menu.checkin,
      checkout: menu.checkout,
    }

    const initialSuggestions = await menuAiRepository.suggests(
      { type: TipoRefeicao.CAFE, date: new Date() },
      context,
      []
    )

    const firstDishName = initialSuggestions.dishes[0].nome

    const regeneratedResult = await sut.execute(
      { menuId: menu.id },
      {
        type: TipoRefeicao.CAFE,
        date: new Date(),
        previousSuggestions: [firstDishName]
      }
    )

    expect(regeneratedResult.dishes.some((d: { nome: any }) => d.nome === firstDishName)).toBe(false)
    expect(regeneratedResult.dishes.length).toBeLessThan(initialSuggestions.dishes.length)
  })

  it("should not be able to regenerate suggestions for non-existing menu", async () => {
    await expect(() =>
      sut.execute(
        { menuId: "non-existing-id" },
        {
          type: TipoRefeicao.ALMOCO,
          date: new Date(),
          previousSuggestions: []
        }
      )
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it("should maintain dietary restrictions throughout the regeneration flow", async () => {
    const menu = await menuRepository.create({
      title: "Dieta Vegetariana",
      adults: 1,
      restricoes: ["vegetariano"],
      preferencias: "",
      checkin: new Date(),
      checkout: new Date(),
    })

    const initialSuggestions = await sut.execute(
      { menuId: menu.id },
      {
        type: TipoRefeicao.ALMOCO,
        date: new Date(),
        previousSuggestions: []
      }
    )

    const hasMeatInitial = initialSuggestions.dishes.some((d: { nome: string }) =>
      d.nome.toLowerCase().includes("peixe") || d.nome.toLowerCase().includes("polvo")
    )
    expect(hasMeatInitial).toBe(false)

    const firstDish = initialSuggestions.dishes[0].nome

    const regeneratedResult = await sut.execute(
      { menuId: menu.id },
      {
        type: TipoRefeicao.ALMOCO,
        date: new Date(),
        previousSuggestions: [firstDish]
      }
    )

    const hasMeatRegenerated = regeneratedResult.dishes.some((d: { nome: string }) =>
      d.nome.toLowerCase().includes("peixe") || d.nome.toLowerCase().includes("polvo")
    )
    expect(hasMeatRegenerated).toBe(false)
    expect(regeneratedResult.dishes.some((d: { nome: any }) => d.nome === firstDish)).toBe(false)
  })

  it("should exhaust all options and return empty list after multiple regenerations", async () => {
    const menu = await menuRepository.create({
      title: "Menu Limitado",
      adults: 1,
      restricoes: [],
      preferencias: "",
      checkin: new Date(),
      checkout: new Date(),
    })

    const initialSuggestions = await menuAiRepository.suggests(
      { type: TipoRefeicao.JANTAR, date: new Date() },
      { ...menu, restricoes: menu.restricoes || [] },
      []
    )

    const allDishesNames = initialSuggestions.dishes.map((d: { nome: any }) => d.nome)

    const result = await sut.execute(
      { menuId: menu.id },
      {
        type: TipoRefeicao.JANTAR,
        date: new Date(),
        previousSuggestions: allDishesNames
      }
    )

    expect(result.dishes).toHaveLength(0)
  })
})