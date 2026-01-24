import { beforeEach, describe, expect, it } from "vitest";
import { CategoriaIngrediente, CategoriaPrato, TipoRefeicao } from "../../../src/generated/prisma/enums";
import { FindAllMenusUseCase } from "../../../src/use-cases/menu/findAll";
import { InMemoryDishRepository } from "../../in-memory/in-memory-dish-repository";
import { InMemoryIngredientRepository } from "../../in-memory/in-memory-ingredient-repository";
import { InMemoryMealRepository } from "../../in-memory/in-memory-meal-repository";
import { InMemoryMenuRepository } from "../../in-memory/in-memory-menu-repository";

describe("Find All Menus Use Case", () => {
  let menuRepository: InMemoryMenuRepository
  let mealRepository: InMemoryMealRepository
  let ingredientRepository: InMemoryIngredientRepository
  let dishRepository: InMemoryDishRepository
  let sut: FindAllMenusUseCase

  beforeEach(() => {
    dishRepository = new InMemoryDishRepository()
    ingredientRepository = new InMemoryIngredientRepository()
    menuRepository = new InMemoryMenuRepository()
    mealRepository = new InMemoryMealRepository(dishRepository)

    sut = new FindAllMenusUseCase(menuRepository)
  })

  it("should return empty list when no menus exist", async () => {
    const { menus, page, totalPages } = await sut.execute()

    expect(menus).toEqual([])
    expect(page).toBe(1)
    expect(totalPages).toBe(0)
  })

  it("should be able to find all menus", async () => {
    const dish = await dishRepository.create({
      nome: "Macarrão à Bolonhesa",
      categoria: CategoriaPrato.ALMOCO,
    })

    await Promise.all([
      ingredientRepository.create(dish.id, {
        nome: "Macarrão",
        quantidade: 400,
        unidade: "g",
        categoria: CategoriaIngrediente.OUTROS
      }),
      ingredientRepository.create(dish.id, {
        nome: "Molho de Tomate",
        quantidade: 200,
        unidade: "g",
        categoria: CategoriaIngrediente.TEMPERO
      })
    ])

    const [menuMaria, menuEraldo] = await Promise.all([
      menuRepository.create({
        title: "Cardapio Maria",
        checkIn: new Date("2026-02-10"),
        checkOut: new Date("2026-02-25"),
        adults: 2,
        kids: 1,
        restricoes: ["sem lactose"],
        preferencias: "Prefere comidas leves"
      }),
      menuRepository.create({
        title: "Cardapio Eraldo",
        checkIn: new Date("2026-02-11"),
        checkOut: new Date("2026-02-15"),
        adults: 2,
        kids: 1,
        restricoes: [],
        preferencias: "Prefere comidas sem carne"
      })
    ])

    await Promise.all([
      mealRepository.create({
        menuId: menuMaria.id,
        date: new Date("2026-02-02"),
        type: TipoRefeicao.ALMOCO,
        dishes: [dish.id]
      }),
      mealRepository.create({
        menuId: menuEraldo.id,
        date: new Date("2026-02-02"),
        type: TipoRefeicao.ALMOCO,
        dishes: [dish.id]
      })
    ])

    const { menus, page, totalPages } = await sut.execute()

    expect(menus).toHaveLength(2)
    expect(page).toBe(1)
    expect(totalPages).toBe(1)

    expect(menus).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: menuMaria.id,
          titulo: "Cardapio Maria",
          adultos: 2,
          criancas: 1,
          restricoes: ["sem lactose"],
          preferencias: "Prefere comidas leves",
        }),
        expect.objectContaining({
          id: menuEraldo.id,
          titulo: "Cardapio Eraldo",
          adultos: 2,
          criancas: 1,
          restricoes: [],
          preferencias: "Prefere comidas sem carne",
        })
      ])
    )
  })

  it("should be able to search menus by title (case-insensitive)", async () => {
    await Promise.all([
      menuRepository.create({
        title: "Família Silva - Janeiro",
        checkIn: new Date("2026-01-15"),
        checkOut: new Date("2026-01-17"),
        adults: 4,
        kids: 2,
        restricoes: ["sem lactose"],
        preferencias: null
      }),
      menuRepository.create({
        title: "Família Silva - Fevereiro",
        checkIn: new Date("2026-02-10"),
        checkOut: new Date("2026-02-15"),
        adults: 4,
        kids: 2,
        restricoes: ["vegetariano"],
        preferencias: null
      }),
      menuRepository.create({
        title: "Família Costa - Janeiro",
        checkIn: new Date("2026-01-10"),
        checkOut: new Date("2026-01-20"),
        adults: 3,
        kids: 1,
        restricoes: [],
        preferencias: null
      })
    ])

    const { menus, } = await sut.execute({ titulo: "silva" })

    expect(menus).toHaveLength(2)
    expect(menus.every((menu: { titulo: string; }) => menu.titulo.toLowerCase().includes("silva"))).toBe(true)
  })

  it("should filter menus by specific date within checkin-checkout period", async () => {
    await Promise.all([
      menuRepository.create({
        title: "Cardápio A",
        checkIn: new Date("2025-01-10"),
        checkOut: new Date("2025-01-12"),
        adults: 2,
        kids: 0,
        restricoes: [],
        preferencias: null
      }),
      menuRepository.create({
        title: "Cardápio B",
        checkIn: new Date("2025-01-15"),
        checkOut: new Date("2025-01-17"),
        adults: 2,
        kids: 0,
        restricoes: [],
        preferencias: null
      }),
      menuRepository.create({
        title: "Cardápio C",
        checkIn: new Date("2025-01-10"),
        checkOut: new Date("2025-01-20"),
        adults: 2,
        kids: 0,
        restricoes: [],
        preferencias: null
      })
    ])

    const { menus } = await sut.execute({ data: "2025-01-15" })

    expect(menus).toHaveLength(2)
    expect(menus).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ titulo: "Cardápio B" }),
        expect.objectContaining({ titulo: "Cardápio C" })
      ])
    )
  })

  it("should return empty list when no menu matches the date filter", async () => {
    await menuRepository.create({
      title: "Cardápio Janeiro",
      checkIn: new Date("2025-01-10"),
      checkOut: new Date("2025-01-20"),
      adults: 2,
      kids: 0,
      restricoes: [],
      preferencias: null
    })

    const { menus, } = await sut.execute({ data: "2025-03-25" })

    expect(menus).toEqual([])
  })


  it("should apply combined filters (search + date)", async () => {
    await Promise.all([
      menuRepository.create({
        title: "Família Silva - Janeiro",
        checkIn: new Date("2025-01-10"),
        checkOut: new Date("2025-01-20"),
        adults: 4,
        kids: 2,
        restricoes: [],
        preferencias: null
      }),
      menuRepository.create({
        title: "Família Silva - Fevereiro",
        checkIn: new Date("2025-02-10"),
        checkOut: new Date("2025-02-20"),
        adults: 4,
        kids: 2,
        restricoes: [],
        preferencias: null
      }),
      menuRepository.create({
        title: "Família Costa - Janeiro",
        checkIn: new Date("2025-01-10"),
        checkOut: new Date("2025-01-20"),
        adults: 3,
        kids: 1,
        restricoes: [],
        preferencias: null
      })
    ])

    const { menus, } = await sut.execute({
      titulo: "silva",
      data: "2025-01-15"
    })

    expect(menus).toHaveLength(1)
    expect(menus[0].titulo).toBe("Família Silva - Janeiro")
  })

  it("should paginate results correctly", async () => {
    const menuPromises = Array.from({ length: 25 }, (_, i) =>
      menuRepository.create({
        title: `Menu ${i + 1}`,
        checkIn: new Date("2026-01-10"),
        checkOut: new Date("2026-01-15"),
        adults: 2,
        kids: 0,
        restricoes: [],
        preferencias: null
      })
    )
    await Promise.all(menuPromises)

    const page1 = await sut.execute({ page: 1 })
    expect(page1.menus).toHaveLength(20)
    expect(page1.page).toBe(1)
    expect(page1.totalPages).toBe(2)

    const page2 = await sut.execute({ page: 2 })
    expect(page2.menus).toHaveLength(5)
    expect(page2.page).toBe(2)
    expect(page2.totalPages).toBe(2)
  })

  it("should respect maximum limit of 100 items per page", async () => {
    const { menus } = await sut.execute({ limit: 150 })

    expect(menus.length).toBeLessThanOrEqual(100)
  })
})