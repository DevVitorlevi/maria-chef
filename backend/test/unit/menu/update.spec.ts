import { beforeEach, describe, expect, it } from "vitest";
import { CategoriaIngrediente, CategoriaPrato, TipoRefeicao } from "../../../src/generated/prisma/enums";
import { UpdateMenuUseCase } from "../../../src/use-cases/menu/update";
import { InMemoryDishRepository } from "../../in-memory/in-memory-dish-repository";
import { InMemoryIngredientRepository } from "../../in-memory/in-memory-ingredient-repository";
import { InMemoryMealRepository } from "../../in-memory/in-memory-meal-repository";
import { InMemoryMenuRepository } from "../../in-memory/in-memory-menu-repository";

describe("Update Menu Use Case", () => {
  let menuRepository: InMemoryMenuRepository
  let mealRepository: InMemoryMealRepository
  let ingredientRepository: InMemoryIngredientRepository
  let dishRepository: InMemoryDishRepository
  let sut: UpdateMenuUseCase

  beforeEach(() => {
    dishRepository = new InMemoryDishRepository()
    ingredientRepository = new InMemoryIngredientRepository()
    mealRepository = new InMemoryMealRepository(dishRepository)
    menuRepository = new InMemoryMenuRepository(mealRepository)

    sut = new UpdateMenuUseCase(menuRepository)
  })

  it("should be able to update only title", async () => {
    const menu = await menuRepository.create({
      title: "Fim de semana",
      checkIn: new Date("2026-01-15"),
      checkOut: new Date("2026-01-17"),
      adults: 4,
      kids: 2,
      restricoes: ["sem_lactose"],
      preferencias: "Gostam de frutas"
    })

    const result = await sut.execute(menu.id, {
      title: "Família Silva - Janeiro"
    })

    expect(result.menu.titulo).toBe("Família Silva - Janeiro")
    expect(result.menu.checkin).toEqual(new Date("2026-01-15"))
    expect(result.menu.checkout).toEqual(new Date("2026-01-17"))
    expect(result.menu.adultos).toBe(4)
    expect(result.menu.criancas).toBe(2)
  })

  it("should be able to update dates when no meals exist", async () => {
    const menu = await menuRepository.create({
      title: "Cardápio Teste",
      checkIn: new Date("2026-01-15"),
      checkOut: new Date("2026-01-17"),
      adults: 2,
      kids: 0,
      restricoes: [],
      preferencias: null
    })

    const result = await sut.execute(menu.id, {
      checkIn: new Date("2026-01-20"),
      checkOut: new Date("2026-01-25")
    })

    expect(result.menu.checkin).toEqual(new Date("2026-01-20"))
    expect(result.menu.checkout).toEqual(new Date("2026-01-25"))
  })

  it("should be able to update number of people", async () => {
    const menu = await menuRepository.create({
      title: "Cardápio Teste",
      checkIn: new Date("2026-01-15"),
      checkOut: new Date("2026-01-17"),
      adults: 4,
      kids: 2,
      restricoes: [],
      preferencias: null
    })

    const result = await sut.execute(menu.id, {
      adults: 6,
      kids: 0
    })

    expect(result.menu.adultos).toBe(6)
    expect(result.menu.criancas).toBe(0)
  })

  it("should not allow period change when meals would be outside new range", async () => {
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

    const menu = await menuRepository.create({
      title: "Cardápio Maria",
      checkIn: new Date("2026-01-10"),
      checkOut: new Date("2026-01-20"),
      adults: 2,
      kids: 1,
      restricoes: ["sem_lactose"],
      preferencias: "Prefere comidas leves"
    })

    await mealRepository.create({
      menuId: menu.id,
      date: new Date("2026-01-15"),
      type: TipoRefeicao.ALMOCO,
      dishes: [dish.id]
    })

    await expect(
      sut.execute(menu.id, {
        checkIn: new Date("2026-01-10"),
        checkOut: new Date("2026-01-12")
      })
    ).rejects.toThrow("Não é possível alterar o período pois existem")
  })

  it("should not allow checkout before checkin", async () => {
    const menu = await menuRepository.create({
      title: "Cardápio Teste",
      checkIn: new Date("2026-01-15"),
      checkOut: new Date("2026-01-17"),
      adults: 2,
      kids: 0,
      restricoes: [],
      preferencias: null
    })

    await expect(
      sut.execute(menu.id, {
        checkIn: new Date("2026-01-15"),
        checkOut: new Date("2026-01-14")
      })
    ).rejects.toThrow("Checkout deve ser posterior ao checkin")
  })

  it("should not allow zero adults", async () => {
    const menu = await menuRepository.create({
      title: "Cardápio Teste",
      checkIn: new Date("2026-01-15"),
      checkOut: new Date("2026-01-17"),
      adults: 2,
      kids: 0,
      restricoes: [],
      preferencias: null
    })

    await expect(
      sut.execute(menu.id, {
        adults: 0
      })
    ).rejects.toThrow("Deve ter pelo menos 1 adulto")
  })

  it("should replace restrictions array completely", async () => {
    const menu = await menuRepository.create({
      title: "Cardápio Teste",
      checkIn: new Date("2026-01-15"),
      checkOut: new Date("2026-01-17"),
      adults: 2,
      kids: 0,
      restricoes: ["sem_lactose"],
      preferencias: null
    })

    const result = await sut.execute(menu.id, {
      restricoes: ["vegetariano", "sem_gluten"]
    })

    expect(result.menu.restricoes).toEqual(["vegetariano", "sem_gluten"])
    expect(result.menu.restricoes).not.toContain("sem_lactose")
  })

  it("should be able to remove all restrictions", async () => {
    const menu = await menuRepository.create({
      title: "Cardápio Teste",
      checkIn: new Date("2026-01-15"),
      checkOut: new Date("2026-01-17"),
      adults: 2,
      kids: 0,
      restricoes: ["sem_lactose", "vegetariano"],
      preferencias: null
    })

    const result = await sut.execute(menu.id, {
      restricoes: []
    })

    expect(result.menu.restricoes).toEqual([])
  })

  it("should throw error when menu does not exist", async () => {
    await expect(
      sut.execute("non-existent-id", {
        title: "Novo Título"
      })
    ).rejects.toThrow("Resource Not Found")
  })

  it("should not allow period longer than 30 days", async () => {
    const menu = await menuRepository.create({
      title: "Cardápio Teste",
      checkIn: new Date("2026-01-01"),
      checkOut: new Date("2026-01-10"),
      adults: 2,
      kids: 0,
      restricoes: [],
      preferencias: null
    })

    await expect(
      sut.execute(menu.id, {
        checkIn: new Date("2026-01-01"),
        checkOut: new Date("2026-02-15")
      })
    ).rejects.toThrow("Período máximo de 30 dias")
  })

  it("should be able to update multiple fields at once", async () => {
    const menu = await menuRepository.create({
      title: "Cardápio Antigo",
      checkIn: new Date("2026-01-15"),
      checkOut: new Date("2026-01-17"),
      adults: 2,
      kids: 0,
      restricoes: ["sem_lactose"],
      preferencias: "Preferências antigas"
    })

    const result = await sut.execute(menu.id, {
      title: "Cardápio Novo",
      adults: 4,
      kids: 2,
      restricoes: ["vegetariano"],
      preferencias: "Novas preferências"
    })

    expect(result.menu.titulo).toBe("Cardápio Novo")
    expect(result.menu.adultos).toBe(4)
    expect(result.menu.criancas).toBe(2)
    expect(result.menu.restricoes).toEqual(["vegetariano"])
    expect(result.menu.preferencias).toBe("Novas preferências")
  })

  it("should not change geradoPorIA field", async () => {
    const menu = await menuRepository.create({
      title: "Cardápio Manual",
      checkIn: new Date("2026-01-15"),
      checkOut: new Date("2026-01-17"),
      adults: 2,
      kids: 0,
      restricoes: [],
      preferencias: null
    })

    const originalGeradoPorIA = menu.geradoPorIA

    const result = await sut.execute(menu.id, {
      title: "Novo Título"
    })

    expect(result.menu.geradoPorIA).toBe(originalGeradoPorIA)
  })

  it("should update updatedAt timestamp", async () => {
    const menu = await menuRepository.create({
      title: "Cardápio Teste",
      checkIn: new Date("2026-01-15"),
      checkOut: new Date("2026-01-17"),
      adults: 2,
      kids: 0,
      restricoes: [],
      preferencias: null
    })

    const originalUpdatedAt = menu.updatedAt

    await new Promise(resolve => setTimeout(resolve, 10))

    const result = await sut.execute(menu.id, {
      title: "Novo Título"
    })

    expect(result.menu.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime())
  })

  it("should be able to clear preferences", async () => {
    const menu = await menuRepository.create({
      title: "Cardápio Teste",
      checkIn: new Date("2026-01-15"),
      checkOut: new Date("2026-01-17"),
      adults: 2,
      kids: 0,
      restricoes: [],
      preferencias: "Preferências existentes"
    })

    const result = await sut.execute(menu.id, {
      preferencias: null
    })

    expect(result.menu.preferencias).toBeNull()
  })

  it("should allow date update when meals remain within new period", async () => {
    const dish = await dishRepository.create({
      nome: "Café da manhã",
      categoria: CategoriaPrato.CAFE_MANHA,
    })

    await ingredientRepository.create(dish.id, {
      nome: "Pão",
      quantidade: 200,
      unidade: "g",
      categoria: CategoriaIngrediente.OUTROS
    })

    const menu = await menuRepository.create({
      title: "Cardápio Teste",
      checkIn: new Date("2026-01-10"),
      checkOut: new Date("2026-01-20"),
      adults: 2,
      kids: 0,
      restricoes: [],
      preferencias: null
    })

    await mealRepository.create({
      menuId: menu.id,
      date: new Date("2026-01-15"),
      type: TipoRefeicao.CAFE,
      dishes: [dish.id]
    })

    const result = await sut.execute(menu.id, {
      checkIn: new Date("2026-01-12"),
      checkOut: new Date("2026-01-18")
    })

    expect(result.menu.checkin).toEqual(new Date("2026-01-12"))
    expect(result.menu.checkout).toEqual(new Date("2026-01-18"))
  })
})