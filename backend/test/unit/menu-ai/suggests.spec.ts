import { beforeEach, describe, expect, it } from "vitest"
import { Menu } from "../../../src/@types/menu"
import { CategoriaPrato, TipoRefeicao } from "../../../src/generated/prisma/enums"
import { MenuAiSuggestsUseCase } from "../../../src/use-cases/menu-ai/suggests"
import { ResourceNotFoundError } from "../../../src/utils/errors/resource-not-found-error"
import { InMemoryDishRepository } from "../../in-memory/in-memory-dish-repository"
import { InMemoryMealRepository } from "../../in-memory/in-memory-meal-repository"
import { InMemoryMenuAiRepository } from "../../in-memory/in-memory-menu-ai-repository"
import { InMemoryMenuRepository } from "../../in-memory/in-memory-menu-repository"
describe("Menu AI Suggestions Use Case", () => {
  let sut: MenuAiSuggestsUseCase
  let menuRepository: InMemoryMenuRepository
  let aiRepository: InMemoryMenuAiRepository
  let mealRepository: InMemoryMealRepository
  let dishRepository: InMemoryDishRepository

  beforeEach(() => {
    dishRepository = new InMemoryDishRepository()
    mealRepository = new InMemoryMealRepository(dishRepository)
    menuRepository = new InMemoryMenuRepository(mealRepository, dishRepository)
    aiRepository = new InMemoryMenuAiRepository()
    sut = new MenuAiSuggestsUseCase(menuRepository, aiRepository)
  })

  function makeContext(menu: Menu) {
    return {
      id: menu.id,
      title: menu.titulo,
      adults: menu.adultos,
      kids: menu.criancas ?? 0,
      restricoes: menu.restricoes,
      preferencias: menu.preferencias,
      checkin: menu.checkin,
      checkout: menu.checkout,
    }
  }

  it("should suggest dishes for breakfast", async () => {
    const menu = await menuRepository.create({
      title: "Cardápio Maria",
      adults: 2,
      kids: 1,
      restricoes: ["sem_lactose"],
      preferencias: "Prefere comidas leves",
      checkIn: new Date("2026-02-10"),
      checkOut: new Date("2026-02-25"),
    })

    const result = await sut.execute(
      { menuId: menu.id, },
      {
        type: TipoRefeicao.CAFE,
        date: new Date("2026-02-15"),
        context: makeContext(menu),
        refeicoes: menu.refeicoes
      }
    )

    expect(result.suggestions).toBeInstanceOf(Array)
    expect(result.suggestions.length).toBeGreaterThan(0)
    expect(result.context.type).toBe(TipoRefeicao.CAFE)
    expect(result.context.people.total).toBe(3)
    expect(result.context.people.adults).toBe(2)
    expect(result.context.people.kids).toBe(1)
    expect(result.notes).toBeTruthy()
  })

  it("should suggest dishes for lunch", async () => {
    const menu = await menuRepository.create({
      title: "Família Costa",
      adults: 4,
      kids: 2,
      restricoes: [],
      checkIn: new Date("2026-03-01"),
      checkOut: new Date("2026-03-10"),
    })

    const result = await sut.execute(
      { menuId: menu.id, },
      {
        type: TipoRefeicao.ALMOCO,
        date: new Date("2026-03-02"),
        context: makeContext(menu),
        refeicoes: menu.refeicoes
      }
    )

    expect(result.suggestions).toBeInstanceOf(Array)
    expect(result.suggestions.length).toBeGreaterThan(0)
    expect(result.context.type).toBe(TipoRefeicao.ALMOCO)
    expect(result.context.date).toEqual(new Date("2026-03-02"))
  })

  it("should suggest dishes for dinner", async () => {
    const menu = await menuRepository.create({
      title: "Família Silva",
      adults: 2,
      kids: 1,
      restricoes: [],
      checkIn: new Date("2026-02-01"),
      checkOut: new Date("2026-02-05"),
    })

    const result = await sut.execute(
      { menuId: menu.id, },
      {
        type: TipoRefeicao.JANTAR,
        date: new Date("2026-02-01"),
        context: makeContext(menu),
        refeicoes: menu.refeicoes
      })

    expect(result.suggestions).toBeInstanceOf(Array)
    expect(result.suggestions.length).toBeGreaterThan(0)
    expect(result.context.type).toBe(TipoRefeicao.JANTAR)
    expect(result.context.date).toEqual(new Date("2026-02-01"))
  })

  it("should filter out dairy dishes when sem_lactose restriction is set", async () => {
    const menu = await menuRepository.create({
      title: "Menu Sem Lactose",
      adults: 3,
      kids: 0,
      restricoes: ["sem_lactose"],
      checkIn: new Date("2026-02-10"),
      checkOut: new Date("2026-02-15"),
    })

    const result = await sut.execute(
      { menuId: menu.id, },
      {
        type: TipoRefeicao.ALMOCO,
        date: new Date("2026-02-02"),
        context: makeContext(menu),
        refeicoes: menu.refeicoes
      })

    const hasDairyCheese = result.suggestions.some(
      (s: string) => s.toLowerCase().includes("queijo") && !s.toLowerCase().includes("vegano"),
    )

    expect(hasDairyCheese).toBe(false)
  })

  it("should filter out fish dishes when vegetariano restriction is set", async () => {
    const menu = await menuRepository.create({
      title: "Menu Vegetariano",
      adults: 6,
      kids: 0,
      restricoes: ["vegetariano"],
      checkIn: new Date("2026-01-15"),
      checkOut: new Date("2026-01-20"),
    })

    const result = await sut.execute(
      { menuId: menu.id, },
      {
        type: TipoRefeicao.ALMOCO,
        date: new Date("2026-01-17"),
        context: makeContext(menu),
        refeicoes: menu.refeicoes
      })

    const hasFish = result.suggestions.some((s: string) =>
      s.toLowerCase().includes("peixe"),
    )

    expect(hasFish).toBe(false)
  })

  it("should filter out bread dishes when sem_gluten restriction is set", async () => {
    const menu = await menuRepository.create({
      title: "Menu Sem Glúten",
      adults: 2,
      kids: 1,
      restricoes: ["sem_gluten"],
      checkIn: new Date("2026-01-15"),
      checkOut: new Date("2026-01-20"),
    })

    const result = await sut.execute(
      { menuId: menu.id, },
      {
        type: TipoRefeicao.ALMOCO,
        date: new Date("2026-01-16"),
        context: makeContext(menu),
        refeicoes: menu.refeicoes
      })

    const hasBread = result.suggestions.some((s: string) =>
      s.toLowerCase().includes("pão"),
    )

    expect(hasBread).toBe(false)
  })

  it("should return suggestions when no restrictions are set", async () => {
    const menu = await menuRepository.create({
      title: "Menu Sem Restrições",
      adults: 4,
      kids: 2,
      restricoes: [],
      checkIn: new Date("2026-02-10"),
      checkOut: new Date("2026-02-15"),
    })

    const result = await sut.execute(
      { menuId: menu.id, },
      {
        type: TipoRefeicao.ALMOCO,
        date: new Date("2026-02-12"),
        context: makeContext(menu),
        refeicoes: menu.refeicoes
      })

    expect(result.suggestions.length).toBeGreaterThan(0)
  })

  it("should return correct menu title in context", async () => {
    const menu = await menuRepository.create({
      title: "Férias na Praia",
      adults: 2,
      kids: 0,
      restricoes: [],
      checkIn: new Date("2026-03-01"),
      checkOut: new Date("2026-03-05"),
    })

    const result = await sut.execute(
      { menuId: menu.id, },
      {
        type: TipoRefeicao.ALMOCO,
        date: new Date("2026-03-02"),
        context: makeContext(menu),
        refeicoes: menu.refeicoes
      })

    expect(result.context.menu).toBe("Férias na Praia")
  })

  it("should include preferences in context when provided", async () => {
    const menu = await menuRepository.create({
      title: "Menu com Prefs",
      adults: 2,
      kids: 0,
      restricoes: [],
      preferencias: "Gosta de frutas tropicais",
      checkIn: new Date("2026-02-10"),
      checkOut: new Date("2026-02-15"),
    })

    const result = await sut.execute(
      { menuId: menu.id, },
      {
        type: TipoRefeicao.ALMOCO,
        date: new Date("2026-02-12"),
        context: makeContext(menu),
        refeicoes: menu.refeicoes
      })

    expect(result.context.preferencias).toBe("Gosta de frutas tropicais")
  })

  it("should not include preferences in context when not provided", async () => {
    const menu = await menuRepository.create({
      title: "Menu sem Prefs",
      adults: 2,
      kids: 0,
      restricoes: [],
      checkIn: new Date("2026-02-10"),
      checkOut: new Date("2026-02-15"),
    })

    const result = await sut.execute(
      { menuId: menu.id, },
      {
        type: TipoRefeicao.ALMOCO,
        date: new Date("2026-02-12"),
        context: makeContext(menu),
        refeicoes: menu.refeicoes
      })

    expect(result.context.preferences).toBeUndefined()
  })

  it("should default kids to 0 when not provided", async () => {
    const menu = await menuRepository.create({
      title: "Menu Adultos",
      adults: 5,
      restricoes: [],
      checkIn: new Date("2026-02-10"),
      checkOut: new Date("2026-02-15"),
    })

    const result = await sut.execute(
      { menuId: menu.id, },
      {
        type: TipoRefeicao.ALMOCO,
        date: new Date("2026-02-12"),
        context: makeContext(menu),
        refeicoes: menu.refeicoes
      })

    expect(result.context.people.kids).toBe(0)
    expect(result.context.people.total).toBe(5)
  })

  it("should exclude already existing dishes from suggestions", async () => {
    const menu = await menuRepository.create({
      title: "Menu com Refeições",
      adults: 2,
      kids: 1,
      restricoes: [],
      checkIn: new Date("2026-02-10"),
      checkOut: new Date("2026-02-15"),
    })

    const prato = await dishRepository.create({
      nome: "Café coado",
      categoria: CategoriaPrato.CAFE_MANHA,
    })

    const meal = await mealRepository.create({
      menuId: menu.id,
      date: new Date("2026-02-11"),
      type: TipoRefeicao.CAFE,
      dishes: [prato.id]
    })

    mealRepository.pratosRelation.set(meal.id, [prato.id])

    const result = await sut.execute(
      { menuId: menu.id, },
      {
        type: TipoRefeicao.CAFE,
        date: new Date("2026-02-12"),
        context: makeContext(menu),
        refeicoes: menu.refeicoes
      })

    expect(result.suggestions).not.toContain("Café coado")
  })

  it("should suggest all options when menu has no meals yet", async () => {
    const menu = await menuRepository.create({
      title: "Menu Novo",
      adults: 2,
      kids: 0,
      restricoes: [],
      checkIn: new Date("2026-02-10"),
      checkOut: new Date("2026-02-15"),
    })

    const result = await sut.execute(
      { menuId: menu.id, },
      {
        type: TipoRefeicao.CAFE,
        date: new Date("2026-02-12"),
        context: makeContext(menu),
        refeicoes: menu.refeicoes
      })

    expect(result.suggestions.length).toBe(6)
  })

  it("should throw ResourceNotFoundError when menu does not exist", async () => {
    const menu = await menuRepository.create({
      title: "Menu Novo",
      adults: 2,
      kids: 0,
      restricoes: [],
      checkIn: new Date("2026-02-10"),
      checkOut: new Date("2026-02-15"),
    })

    await expect(
      sut.execute({ menuId: "non-existent", },
        {
          type: TipoRefeicao.ALMOCO,
          date: new Date("2026-02-12"),
          context: makeContext(menu),
          refeicoes: menu.refeicoes
        }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})