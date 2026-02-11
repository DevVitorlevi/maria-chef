import { Ingrediente } from "@/generated/prisma/client"
import { TipoRefeicao } from "@/generated/prisma/enums"
import { MenuAiSuggestsUseCase } from "@/use-cases/menu-ai/suggests"
import { ResourceNotFoundError } from "@/utils/errors/resource-not-found-error"
import { beforeEach, describe, expect, it } from "vitest"
import { InMemoryDishRepository } from "../../in-memory/in-memory-dish-repository"
import { InMemoryMealRepository } from "../../in-memory/in-memory-meal-repository"
import { InMemoryMenuAiRepository } from "../../in-memory/in-memory-menu-ai-repository"
import { InMemoryMenuRepository } from "../../in-memory/in-memory-menu-repository"

describe("Menu AI Suggests Use Case (Unit)", () => {
  let sut: MenuAiSuggestsUseCase
  let menuRepository: InMemoryMenuRepository
  let aiRepository: InMemoryMenuAiRepository
  let mealRepository: InMemoryMealRepository
  let dishRepository: InMemoryDishRepository

  beforeEach(() => {
    const sharedIngredients: Ingrediente[] = []
    dishRepository = new InMemoryDishRepository(sharedIngredients)
    mealRepository = new InMemoryMealRepository(dishRepository)
    menuRepository = new InMemoryMenuRepository(mealRepository, dishRepository)
    aiRepository = new InMemoryMenuAiRepository()
    sut = new MenuAiSuggestsUseCase(menuRepository, aiRepository)
  })

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
      { menuId: menu.id },
      {
        type: TipoRefeicao.CAFE,
        date: new Date("2026-02-15"),
      }
    )

    expect(result.dishes).toBeInstanceOf(Array)
    expect(result.dishes.length).toBeGreaterThan(0)
    expect(result.dishes[0]?.ingredientes).toBeInstanceOf(Array)
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
      { menuId: menu.id },
      {
        type: TipoRefeicao.ALMOCO,
        date: new Date("2026-03-02"),
      }
    )

    expect(result.dishes).toBeInstanceOf(Array)
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
      { menuId: menu.id },
      {
        type: TipoRefeicao.JANTAR,
        date: new Date("2026-02-01"),
      }
    )

    expect(result.dishes).toBeInstanceOf(Array)
    expect(result.context.type).toBe(TipoRefeicao.JANTAR)
    expect(result.context.date).toEqual(new Date("2026-02-01"))
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
      { menuId: menu.id },
      {
        type: TipoRefeicao.ALMOCO,
        date: new Date("2026-03-02"),
      }
    )

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
      { menuId: menu.id },
      {
        type: TipoRefeicao.ALMOCO,
        date: new Date("2026-02-12"),
      }
    )

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
      { menuId: menu.id },
      {
        type: TipoRefeicao.ALMOCO,
        date: new Date("2026-02-12"),
      }
    )

    expect(result.context.preferencias).toBeUndefined()
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
      { menuId: menu.id },
      {
        type: TipoRefeicao.ALMOCO,
        date: new Date("2026-02-12"),
      }
    )

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
      categoria: "CAFE_MANHA" as any,
    })

    await mealRepository.create({
      menuId: menu.id,
      date: new Date("2026-02-11"),
      type: TipoRefeicao.CAFE,
      dishes: [prato.id],
    })

    const result = await sut.execute(
      { menuId: menu.id },
      {
        type: TipoRefeicao.CAFE,
        date: new Date("2026-02-12"),
      }
    )

    const dishNames = result.dishes.map((d: { nome: string }) => d.nome.toLowerCase())
    expect(dishNames).not.toContain("café coado")
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
      { menuId: menu.id },
      {
        type: TipoRefeicao.CAFE,
        date: new Date("2026-02-12"),
      }
    )

    expect(result.dishes.length).toBeGreaterThan(0)
  })

  it("should throw ResourceNotFoundError when menu does not exist", async () => {
    await expect(
      sut.execute(
        { menuId: "non-existent" },
        {
          type: TipoRefeicao.ALMOCO,
          date: new Date(),
        }
      )
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it("should filter dishes by restrictions", async () => {
    const menu = await menuRepository.create({
      title: "Menu Restrito",
      adults: 2,
      kids: 0,
      restricoes: ["sem_lactose"],
      checkIn: new Date("2026-02-10"),
      checkOut: new Date("2026-02-15"),
    })

    const result = await sut.execute(
      { menuId: menu.id },
      {
        type: TipoRefeicao.CAFE,
        date: new Date("2026-02-12"),
      }
    )

    const hasNonVeganCheese = result.dishes.some((d: { nome: string }) =>
      d.nome.toLowerCase().includes("queijo") &&
      !d.nome.toLowerCase().includes("vegano")
    )

    expect(hasNonVeganCheese).toBe(false)
  })

  it("should calculate total people correctly", async () => {
    const menu = await menuRepository.create({
      title: "Família Grande",
      adults: 6,
      kids: 3,
      restricoes: [],
      checkIn: new Date("2026-02-10"),
      checkOut: new Date("2026-02-15"),
    })

    const result = await sut.execute(
      { menuId: menu.id },
      {
        type: TipoRefeicao.ALMOCO,
        date: new Date("2026-02-12"),
      }
    )

    expect(result.context.people.adults).toBe(6)
    expect(result.context.people.kids).toBe(3)
    expect(result.context.people.total).toBe(9)
  })
})