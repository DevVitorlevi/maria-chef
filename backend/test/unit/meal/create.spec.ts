import { beforeEach, describe, expect, it } from "vitest";
import { CategoriaIngrediente, CategoriaPrato, TipoRefeicao } from "../../../src/generated/prisma/enums";
import { CreateMealUseCase } from "../../../src/use-cases/meal/create";
import { ResourceNotFoundError } from "../../../src/utils/errors/resource-not-found-error";
import { InMemoryDishRepository } from "../../in-memory/in-memory-dish-repository";
import { InMemoryIngredientRepository } from "../../in-memory/in-memory-ingredient-repository";
import { InMemoryMealRepository } from "../../in-memory/in-memory-meal-repository";
import { InMemoryMenuRepository } from "../../in-memory/in-memory-menu-repository";

describe("Create Meal Use Case", () => {
  let menuRepository: InMemoryMenuRepository
  let mealRepository: InMemoryMealRepository
  let ingredientRepository: InMemoryIngredientRepository
  let dishRepository: InMemoryDishRepository
  let sut: CreateMealUseCase

  beforeEach(() => {
    dishRepository = new InMemoryDishRepository()
    ingredientRepository = new InMemoryIngredientRepository()
    menuRepository = new InMemoryMenuRepository()
    mealRepository = new InMemoryMealRepository(dishRepository)

    sut = new CreateMealUseCase(mealRepository, menuRepository)
  })

  it("should be able to create a meal in an existing menu", async () => {
    const dish = await dishRepository.create({
      nome: "Macarrão à Bolonhesa",
      categoria: CategoriaPrato.ALMOCO,
    })

    await ingredientRepository.create(dish.id, {
      nome: "Macarrão",
      quantidade: 400,
      unidade: "g",
      categoria: CategoriaIngrediente.OUTROS
    })

    await ingredientRepository.create(dish.id, {
      nome: "Molho de Tomate",
      quantidade: 200,
      unidade: "g",
      categoria: CategoriaIngrediente.TEMPERO
    })

    const menu = await menuRepository.create({
      title: "Cardapio Maria",
      checkIn: new Date("2026-02-01"),
      checkOut: new Date("2026-02-05"),
      adults: 2,
      kids: 1,
      restricoes: ["sem lactose"],
      preferencias: "Prefere comidas leves"
    })

    const { meal } = await sut.execute({
      menuId: menu.id,
      date: new Date("2026-02-02"),
      type: TipoRefeicao.ALMOCO,
      dishes: [dish.id]
    })

    expect(meal.id).toBeDefined()
    expect(meal.cardapioId).toBe(menu.id)
    expect(meal.tipo).toBe(TipoRefeicao.ALMOCO)
    expect(meal.pratos).toBeDefined()
    expect(meal.pratos).toHaveLength(1)
    expect(meal.pratos[0].id).toBe(dish.id)
  })

  it("should be able to create a meal with multiple dishes", async () => {
    const dish1 = await dishRepository.create({
      nome: "Arroz Integral",
      categoria: CategoriaPrato.ALMOCO,
    })

    const dish2 = await dishRepository.create({
      nome: "Feijão Preto",
      categoria: CategoriaPrato.ALMOCO,
    })

    const dish3 = await dishRepository.create({
      nome: "Frango Grelhado",
      categoria: CategoriaPrato.ALMOCO,
    })

    const menu = await menuRepository.create({
      title: "Cardápio Fitness",
      checkIn: new Date("2026-03-01"),
      checkOut: new Date("2026-03-07"),
      adults: 1,
      kids: 0,
    })

    const { meal } = await sut.execute({
      menuId: menu.id,
      date: new Date("2026-03-02"),
      type: TipoRefeicao.ALMOCO,
      dishes: [dish1.id, dish2.id, dish3.id]
    })

    expect(meal.pratos).toHaveLength(3)
    expect(meal.pratos.map((p: { id: any; }) => p.id)).toEqual(
      expect.arrayContaining([dish1.id, dish2.id, dish3.id])
    )
  })

  it("should be able to create different meal types", async () => {
    const breakfast = await dishRepository.create({
      nome: "Pão com Manteiga",
      categoria: CategoriaPrato.CAFE_MANHA,
    })

    const lunch = await dishRepository.create({
      nome: "Salada Caesar",
      categoria: CategoriaPrato.ALMOCO,
    })

    const dinner = await dishRepository.create({
      nome: "Sopa de Legumes",
      categoria: CategoriaPrato.JANTAR,
    })

    const snack = await dishRepository.create({
      nome: "Frutas Variadas",
      categoria: CategoriaPrato.LANCHE,
    })

    const menu = await menuRepository.create({
      title: "Cardápio Completo",
      checkIn: new Date("2026-04-01"),
      checkOut: new Date("2026-04-03"),
      adults: 2,
      kids: 0,
    })

    const breakfastMeal = await sut.execute({
      menuId: menu.id,
      date: new Date("2026-04-01"),
      type: TipoRefeicao.CAFE,
      dishes: [breakfast.id]
    })

    const lunchMeal = await sut.execute({
      menuId: menu.id,
      date: new Date("2026-04-01"),
      type: TipoRefeicao.ALMOCO,
      dishes: [lunch.id]
    })

    const dinnerMeal = await sut.execute({
      menuId: menu.id,
      date: new Date("2026-04-01"),
      type: TipoRefeicao.JANTAR,
      dishes: [dinner.id]
    })


    expect(breakfastMeal.meal.tipo).toBe(TipoRefeicao.CAFE)
    expect(lunchMeal.meal.tipo).toBe(TipoRefeicao.ALMOCO)
    expect(dinnerMeal.meal.tipo).toBe(TipoRefeicao.JANTAR)
  })

  it("should not be able to create a meal in a non-existing menu", async () => {
    const dish = await dishRepository.create({
      nome: "Pizza",
      categoria: CategoriaPrato.JANTAR,
    })

    await expect(() =>
      sut.execute({
        menuId: "non-existing-menu-id",
        date: new Date("2026-02-02"),
        type: TipoRefeicao.JANTAR,
        dishes: [dish.id]
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it("should be able to create meals for different dates in the same menu", async () => {
    const dish = await dishRepository.create({
      nome: "Omelete",
      categoria: CategoriaPrato.CAFE_MANHA,
    })

    const menu = await menuRepository.create({
      title: "Cardápio Semanal",
      checkIn: new Date("2026-05-01"),
      checkOut: new Date("2026-05-07"),
      adults: 2,
      kids: 1,
    })

    const meal1 = await sut.execute({
      menuId: menu.id,
      date: new Date("2026-05-01"),
      type: TipoRefeicao.CAFE,
      dishes: [dish.id]
    })

    const meal2 = await sut.execute({
      menuId: menu.id,
      date: new Date("2026-05-02"),
      type: TipoRefeicao.CAFE,
      dishes: [dish.id]
    })

    const meal3 = await sut.execute({
      menuId: menu.id,
      date: new Date("2026-05-03"),
      type: TipoRefeicao.CAFE,
      dishes: [dish.id]
    })

    expect(meal1.meal.id).not.toBe(meal2.meal.id)
    expect(meal2.meal.id).not.toBe(meal3.meal.id)
    expect(meal1.meal.cardapioId).toBe(menu.id)
    expect(meal2.meal.cardapioId).toBe(menu.id)
    expect(meal3.meal.cardapioId).toBe(menu.id)
  })

  it("should be able to create multiple meals for the same date with different types", async () => {
    const dish1 = await dishRepository.create({
      nome: "Café com Leite",
      categoria: CategoriaPrato.CAFE_MANHA,
    })

    const dish2 = await dishRepository.create({
      nome: "Feijoada",
      categoria: CategoriaPrato.ALMOCO,
    })

    const menu = await menuRepository.create({
      title: "Cardápio do Dia",
      checkIn: new Date("2026-06-01"),
      checkOut: new Date("2026-06-02"),
      adults: 3,
      kids: 2,
    })

    const sameDate = new Date("2026-06-01")

    const breakfastMeal = await sut.execute({
      menuId: menu.id,
      date: sameDate,
      type: TipoRefeicao.CAFE,
      dishes: [dish1.id]
    })

    const lunchMeal = await sut.execute({
      menuId: menu.id,
      date: sameDate,
      type: TipoRefeicao.ALMOCO,
      dishes: [dish2.id]
    })

    expect(breakfastMeal.meal.data).toEqual(lunchMeal.meal.data)
    expect(breakfastMeal.meal.tipo).not.toBe(lunchMeal.meal.tipo)
    expect(breakfastMeal.meal.id).not.toBe(lunchMeal.meal.id)
  })
})