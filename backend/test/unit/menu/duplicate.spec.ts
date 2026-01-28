import { beforeEach, describe, expect, it } from "vitest";
import { CategoriaPrato, TipoRefeicao } from "../../../src/generated/prisma/enums";
import { DuplicateMenuUseCase } from "../../../src/use-cases/menu/duplicate";
import { ResourceNotFoundError } from "../../../src/utils/errors/resource-not-found-error";
import { InMemoryDishRepository } from "../../in-memory/in-memory-dish-repository";
import { InMemoryMealRepository } from "../../in-memory/in-memory-meal-repository";
import { InMemoryMenuRepository } from "../../in-memory/in-memory-menu-repository";

describe("Duplicate Menu Use Case", () => {
  let menuRepository: InMemoryMenuRepository
  let mealRepository: InMemoryMealRepository
  let dishRepository: InMemoryDishRepository
  let sut: DuplicateMenuUseCase

  beforeEach(() => {
    dishRepository = new InMemoryDishRepository()
    mealRepository = new InMemoryMealRepository(dishRepository)
    menuRepository = new InMemoryMenuRepository(mealRepository, dishRepository)

    sut = new DuplicateMenuUseCase(menuRepository)
  })

  it("should be able to duplicate a menu with success", async () => {
    const menu = await menuRepository.create({
      title: "Família Silva",
      checkIn: new Date("2026-01-15"),
      checkOut: new Date("2026-01-17"),
      adults: 4,
      kids: 2,
      restricoes: ["sem_lactose"],
      preferencias: "Gostam de frutas"
    })

    const [dish1, dish2] = await Promise.all([
      await dishRepository.create({
        nome: "Tapioca de queijo",
        categoria: CategoriaPrato.CAFE_MANHA,
      }),
      await dishRepository.create({
        nome: "Arroz com Feijão",
        categoria: CategoriaPrato.ALMOCO,
      })
    ])

    await Promise.all([
      mealRepository.create({
        menuId: menu.id,
        date: new Date("2026-01-15"),
        type: TipoRefeicao.CAFE,
        dishes: [dish1.id]
      }),
      mealRepository.create({
        menuId: menu.id,
        date: new Date("2026-01-15"),
        type: TipoRefeicao.ALMOCO,
        dishes: [dish2.id]
      })
    ])

    const result = await sut.execute({ menuId: menu.id })
    expect(result.cardapio.id).not.toBe(menu.id)
    expect(result.cardapio.titulo).toBe("Família Silva (cópia)")
    expect(result.cardapio.checkin).toEqual(new Date("2026-01-15"))
    expect(result.cardapio.checkout).toEqual(new Date("2026-01-17"))
    expect(result.cardapio.adultos).toBe(4)
    expect(result.cardapio.criancas).toBe(2)
    expect(result.cardapio.restricoes).toEqual(["sem_lactose"])
    expect(result.cardapio.preferencias).toBe("Gostam de frutas")
    expect(result.cardapio.refeicoes).toHaveLength(2)
    expect(result.cardapio.createdAt).toBeInstanceOf(Date)
    expect(result.cardapio.updatedAt).toBeInstanceOf(Date)
  })

  it("should add another '(cópia)' suffix when duplicating already duplicated menu", async () => {
    const originalMenu = await menuRepository.create({
      title: "Família Silva",
      checkIn: new Date("2026-01-15"),
      checkOut: new Date("2026-01-17"),
      adults: 2,
      kids: 0,
      restricoes: [],
      preferencias: null
    })

    const firstDuplicate = await sut.execute({ menuId: originalMenu.id })
    expect(firstDuplicate.cardapio.titulo).toBe("Família Silva (cópia)")

    const secondDuplicate = await sut.execute({ menuId: firstDuplicate.cardapio.id })
    expect(secondDuplicate.cardapio.titulo).toBe("Família Silva (cópia) (cópia)")
  })

  it("should copy all meals with correct data, type and dishes", async () => {
    const menu = await menuRepository.create({
      title: "Cardápio Completo",
      checkIn: new Date("2026-01-15"),
      checkOut: new Date("2026-01-17"),
      adults: 2,
      kids: 1,
      restricoes: [],
      preferencias: null
    })

    const [dish1, dish2, dish3, dish4, dish5] = await Promise.all([
      dishRepository.create({
        nome: "Tapioca",
        categoria: CategoriaPrato.CAFE_MANHA,
      }),

      dishRepository.create({
        nome: "Frutas",
        categoria: CategoriaPrato.CAFE_MANHA,
      }),

      dishRepository.create({
        nome: "Arroz",
        categoria: CategoriaPrato.ALMOCO,
      }),

      dishRepository.create({
        nome: "Feijão",
        categoria: CategoriaPrato.ALMOCO,
      }),

      dishRepository.create({
        nome: "Frango",
        categoria: CategoriaPrato.ALMOCO,
      }),
    ])

    const [originalMeal1, originalMeal2] = await Promise.all([
      mealRepository.create({
        menuId: menu.id,
        date: new Date("2026-01-15"),
        type: TipoRefeicao.CAFE,
        dishes: [dish1.id, dish2.id]
      }),
      mealRepository.create({
        menuId: menu.id,
        date: new Date("2026-01-15"),
        type: TipoRefeicao.ALMOCO,
        dishes: [dish3.id, dish4.id, dish5.id]
      })
    ])

    const result = await sut.execute({ menuId: menu.id })

    expect(result.cardapio.refeicoes).toHaveLength(2)

    const cafeMeal = result.cardapio.refeicoes.find((m: { tipo: string; }) => m.tipo === TipoRefeicao.CAFE)
    const almocoMeal = result.cardapio.refeicoes.find((m: { tipo: string; }) => m.tipo === TipoRefeicao.ALMOCO)

    expect(cafeMeal).toBeDefined()
    expect(cafeMeal!.id).not.toBe(originalMeal1.id)
    expect(cafeMeal!.data).toEqual(new Date("2026-01-15"))
    expect(cafeMeal!.pratos).toHaveLength(2)
    expect(cafeMeal!.pratos.map((p: { id: any; }) => p.id)).toContain(dish1.id)
    expect(cafeMeal!.pratos.map((p: { id: any; }) => p.id)).toContain(dish2.id)

    expect(almocoMeal).toBeDefined()
    expect(almocoMeal!.id).not.toBe(originalMeal2.id)
    expect(almocoMeal!.data).toEqual(new Date("2026-01-15"))
    expect(almocoMeal!.pratos).toHaveLength(3)
    expect(almocoMeal!.pratos.map((p: { id: any; }) => p.id)).toContain(dish3.id)
    expect(almocoMeal!.pratos.map((p: { id: any; }) => p.id)).toContain(dish4.id)
    expect(almocoMeal!.pratos.map((p: { id: any; }) => p.id)).toContain(dish5.id)
  })

  it("should throw error when menu does not exist", async () => {
    await expect(() =>
      sut.execute("non-existent-id")
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it("should be able to duplicate menu without meals", async () => {
    const menu = await menuRepository.create({
      title: "Cardápio Vazio",
      checkIn: new Date("2026-02-01"),
      checkOut: new Date("2026-02-05"),
      adults: 2,
      kids: 0,
      restricoes: [],
      preferencias: null
    })

    const result = await sut.execute({ menuId: menu.id })

    expect(result.cardapio.id).not.toBe(menu.id)
    expect(result.cardapio.titulo).toBe("Cardápio Vazio (cópia)")
    expect(result.cardapio.refeicoes).toHaveLength(0)
  })

  it("should create independent copy - editing duplicate does not affect original", async () => {
    const originalMenu = await menuRepository.create({
      title: "Menu Original",
      checkIn: new Date("2026-03-01"),
      checkOut: new Date("2026-03-05"),
      adults: 2,
      kids: 1,
      restricoes: ["vegetariano"],
      preferencias: "Preferências originais"
    })

    const dish = await dishRepository.create({
      nome: "Salada",
      categoria: CategoriaPrato.ALMOCO,
    })

    await mealRepository.create({
      menuId: originalMenu.id,
      date: new Date("2026-03-01"),
      type: TipoRefeicao.ALMOCO,
      dishes: [dish.id]
    })

    const duplicate = await sut.execute({ menuId: originalMenu.id })

    expect(duplicate.cardapio.id).not.toBe(originalMenu.id)
    expect(duplicate.cardapio.refeicoes[0].id).not.toBe(
      (await menuRepository.findById(originalMenu.id))!.refeicoes[0].id
    )

    await menuRepository.update(duplicate.cardapio.id, {
      title: "Menu Modificado",
      adults: 10
    })

    const originalAfterEdit = await menuRepository.findById(originalMenu.id)
    expect(originalAfterEdit!.titulo).toBe("Menu Original")
    expect(originalAfterEdit!.adultos).toBe(2)
  })

  it("should generate new IDs for menu and all meals", async () => {
    const menu = await menuRepository.create({
      title: "Test Menu",
      checkIn: new Date("2026-05-01"),
      checkOut: new Date("2026-05-03"),
      adults: 2,
      kids: 0,
      restricoes: [],
      preferencias: null
    })

    const dish = await dishRepository.create({
      nome: "Test Dish",
      categoria: CategoriaPrato.ALMOCO,
    })

    const [meal1, meal2, meal3] = await Promise.all([
      await mealRepository.create({
        menuId: menu.id,
        date: new Date("2026-05-01"),
        type: TipoRefeicao.CAFE,
        dishes: [dish.id]
      }),

      mealRepository.create({
        menuId: menu.id,
        date: new Date("2026-05-01"),
        type: TipoRefeicao.ALMOCO,
        dishes: [dish.id]
      }),

      mealRepository.create({
        menuId: menu.id,
        date: new Date("2026-05-01"),
        type: TipoRefeicao.JANTAR,
        dishes: [dish.id]
      })
    ])

    const result = await sut.execute({ menuId: menu.id })

    expect(result.cardapio.id).not.toBe(menu.id)

    const originalMealIds = [meal1.id, meal2.id, meal3.id]
    const duplicatedMealIds = result.cardapio.refeicoes.map((m: { id: any; }) => m.id)

    duplicatedMealIds.forEach((duplicatedId: any) => {
      expect(originalMealIds).not.toContain(duplicatedId)
    })

    result.cardapio.refeicoes.forEach((meal: { cardapioId: any; }) => {
      expect(meal.cardapioId).toBe(result.cardapio.id)
    })
  })

  it("should set createdAt and updatedAt to current date", async () => {
    const menu = await menuRepository.create({
      title: "Old Menu",
      checkIn: new Date("2026-06-01"),
      checkOut: new Date("2026-06-03"),
      adults: 2,
      kids: 0,
      restricoes: [],
      preferencias: null
    })

    const beforeDuplicate = new Date()

    await new Promise(resolve => setTimeout(resolve, 10))

    const result = await sut.execute({ menuId: menu.id })

    const afterDuplicate = new Date()

    expect(result.cardapio.createdAt.getTime()).toBeGreaterThanOrEqual(beforeDuplicate.getTime())
    expect(result.cardapio.createdAt.getTime()).toBeLessThanOrEqual(afterDuplicate.getTime())
    expect(result.cardapio.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeDuplicate.getTime())
    expect(result.cardapio.updatedAt.getTime()).toBeLessThanOrEqual(afterDuplicate.getTime())
  })

  it("should duplicate menu with meals on different dates", async () => {
    const menu = await menuRepository.create({
      title: "Weekend Menu",
      checkIn: new Date("2026-07-01"),
      checkOut: new Date("2026-07-05"),
      adults: 2,
      kids: 0,
      restricoes: [],
      preferencias: null
    })

    const dish = await dishRepository.create({
      nome: "Universal Dish",
      categoria: CategoriaPrato.ALMOCO,
    })

    await Promise.all([
      mealRepository.create({
        menuId: menu.id,
        date: new Date("2026-07-01"),
        type: TipoRefeicao.CAFE,
        dishes: [dish.id]
      }),

      mealRepository.create({
        menuId: menu.id,
        date: new Date("2026-07-02"),
        type: TipoRefeicao.ALMOCO,
        dishes: [dish.id]
      }),

      mealRepository.create({
        menuId: menu.id,
        date: new Date("2026-07-03"),
        type: TipoRefeicao.JANTAR,
        dishes: [dish.id]
      }),

      mealRepository.create({
        menuId: menu.id,
        date: new Date("2026-07-04"),
        type: TipoRefeicao.CAFE,
        dishes: [dish.id]
      })
    ])

    const result = await sut.execute({ menuId: menu.id })

    expect(result.cardapio.refeicoes).toHaveLength(4)

    const dates = result.cardapio.refeicoes.map((m: { data: { toISOString: () => any; }; }) => m.data.toISOString())
    expect(dates).toContain(new Date("2026-07-01").toISOString())
    expect(dates).toContain(new Date("2026-07-02").toISOString())
    expect(dates).toContain(new Date("2026-07-03").toISOString())
    expect(dates).toContain(new Date("2026-07-04").toISOString())
  })

  it("should keep original menu unchanged after duplication", async () => {
    const menu = await menuRepository.create({
      title: "Original Menu",
      checkIn: new Date("2026-08-01"),
      checkOut: new Date("2026-08-05"),
      adults: 3,
      kids: 2,
      restricoes: ["sem_gluten"],
      preferencias: "Original preferences"
    })

    const dish = await dishRepository.create({
      nome: "Test Dish",
      categoria: CategoriaPrato.ALMOCO,
    })

    await mealRepository.create({
      menuId: menu.id,
      date: new Date("2026-08-01"),
      type: TipoRefeicao.ALMOCO,
      dishes: [dish.id]
    })

    const originalBeforeDuplicate = await menuRepository.findById(menu.id)

    await sut.execute({ menuId: menu.id })

    const originalAfterDuplicate = await menuRepository.findById(menu.id)

    expect(originalAfterDuplicate).toEqual(originalBeforeDuplicate)
  })

  it("should copy restricoes and preferencias correctly", async () => {
    const menu = await menuRepository.create({
      title: "Special Menu",
      checkIn: new Date("2026-09-01"),
      checkOut: new Date("2026-09-05"),
      adults: 2,
      kids: 1,
      restricoes: ["vegetariano", "sem_lactose", "sem_gluten"],
      preferencias: "Preferem comidas leves e saudáveis"
    })

    const result = await sut.execute({ menuId: menu.id })

    expect(result.cardapio.restricoes).toEqual(["vegetariano", "sem_lactose", "sem_gluten"])
    expect(result.cardapio.preferencias).toBe("Preferem comidas leves e saudáveis")
  })
})