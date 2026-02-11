import { Ingrediente } from "@/generated/prisma/client"
import { CategoriaIngrediente, CategoriaPrato, TipoRefeicao } from "@/generated/prisma/enums"
import { AcceptMenuAISuggestionsUseCase } from "@/use-cases/menu-ai/accept-suggestions"
import { InvalidDateError } from "@/utils/errors/invalid-date-error"
import { ResourceNotFoundError } from "@/utils/errors/resource-not-found-error"
import { beforeEach, describe, expect, it } from "vitest"
import { InMemoryDishRepository } from "../../in-memory/in-memory-dish-repository"
import { InMemoryIngredientRepository } from "../../in-memory/in-memory-ingredient-repository"
import { InMemoryMealRepository } from "../../in-memory/in-memory-meal-repository"
import { InMemoryMenuRepository } from "../../in-memory/in-memory-menu-repository"

describe("Accept Menu AI Suggestions Use Case (Unit)", () => {
  let sut: AcceptMenuAISuggestionsUseCase
  let menuRepository: InMemoryMenuRepository
  let mealRepository: InMemoryMealRepository
  let dishRepository: InMemoryDishRepository
  let ingredientRepository: InMemoryIngredientRepository

  beforeEach(() => {
    const sharedIngredients: Ingrediente[] = []
    ingredientRepository = new InMemoryIngredientRepository(sharedIngredients)
    dishRepository = new InMemoryDishRepository(sharedIngredients)
    mealRepository = new InMemoryMealRepository(dishRepository)
    menuRepository = new InMemoryMenuRepository(mealRepository, dishRepository)

    sut = new AcceptMenuAISuggestionsUseCase(
      menuRepository,
      mealRepository,
      dishRepository,
      ingredientRepository
    )
  })

  it("should accept suggestions and create dishes with ingredients", async () => {
    const menu = await menuRepository.create({
      title: "Viagem Família",
      adults: 2,
      checkIn: new Date("2026-02-01"),
      checkOut: new Date("2026-02-05"),
      restricoes: [],
    })

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

    await mealRepository.create({
      menuId: menu.id,
      date: new Date("2026-02-01"),
      type: TipoRefeicao.ALMOCO,
      dishes: [dish.id]
    })

    const suggestionData = {
      type: TipoRefeicao.ALMOCO,
      date: new Date("2026-02-02"),
      dishes: [
        {
          nome: "Frango Grelhado",
          categoria: CategoriaPrato.ALMOCO,
          ingredientes: [
            {
              nome: "Peito de Frango",
              quantidade: 500,
              unidade: "g",
              categoria: CategoriaIngrediente.PROTEINA
            }
          ]
        }
      ]
    }

    const result = await sut.execute(
      { menuId: menu.id },
      suggestionData
    )

    expect(result.meal.id).toBeTruthy()

    const mealOn = await mealRepository.findById({
      id: result.meal.id,
      menuId: result.meal.cardapioId
    })

    expect(mealOn.meal.pratos).toHaveLength(1)
    expect(mealOn.meal.pratos[0]?.nome).toBe("Frango Grelhado")
    expect(mealOn.meal.pratos[0]?.ingredientes).toHaveLength(1)
    expect(mealOn.meal.pratos[0]?.ingredientes[0]?.nome).toBe("Peito de Frango")
  })

  it("should throw InvalidDateError when date is before check-in", async () => {
    const menu = await menuRepository.create({
      title: "Menu Curto",
      adults: 1,
      checkIn: new Date("2026-05-10"),
      checkOut: new Date("2026-05-15"),
      restricoes: [],
    })

    await expect(
      sut.execute(
        { menuId: menu.id },
        {
          date: new Date("2026-05-09"),
          type: TipoRefeicao.JANTAR,
          dishes: []
        }
      )
    ).rejects.toBeInstanceOf(InvalidDateError)
  })

  it("should throw InvalidDateError when date is after check-out", async () => {
    const menu = await menuRepository.create({
      title: "Menu Curto",
      adults: 1,
      checkIn: new Date("2026-05-10"),
      checkOut: new Date("2026-05-15"),
      restricoes: [],
    })

    await expect(
      sut.execute(
        { menuId: menu.id },
        {
          date: new Date("2026-05-16"),
          type: TipoRefeicao.JANTAR,
          dishes: []
        }
      )
    ).rejects.toBeInstanceOf(InvalidDateError)
  })

  it("should throw ResourceNotFoundError when menu does not exist", async () => {
    await expect(
      sut.execute(
        { menuId: "id-inexistente" },
        {
          date: new Date(),
          type: TipoRefeicao.ALMOCO,
          dishes: []
        }
      )
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it("should persist multiple dishes and multiple ingredients correctly", async () => {
    const menu = await menuRepository.create({
      title: "Banquete",
      adults: 10,
      checkIn: new Date("2026-01-01"),
      checkOut: new Date("2026-01-01"),
      restricoes: [],
    })

    const result = await sut.execute(
      { menuId: menu.id },
      {
        date: new Date("2026-01-01"),
        type: TipoRefeicao.ALMOCO,
        dishes: [
          {
            nome: "Frango Grelhado",
            categoria: CategoriaPrato.ALMOCO,
            ingredientes: [
              {
                nome: "Peito de Frango",
                quantidade: 1,
                unidade: "kg",
                categoria: CategoriaIngrediente.PROTEINA
              },
            ]
          },
          {
            nome: "Tilapia Grelhada",
            categoria: CategoriaPrato.ALMOCO,
            ingredientes: [
              {
                nome: "File de Tilapia",
                quantidade: 1,
                unidade: "kg",
                categoria: CategoriaIngrediente.PROTEINA
              }
            ]
          }
        ]
      }
    )

    expect(result.meal.id).toBeTruthy()

    const mealOn = await mealRepository.findById({
      id: result.meal.id,
      menuId: result.meal.cardapioId
    })

    expect(mealOn.meal.pratos).toHaveLength(2)
    expect(mealOn.meal.pratos[0]?.nome).toBe("Frango Grelhado")
    expect(mealOn.meal.pratos[1]?.nome).toBe("Tilapia Grelhada")
  })
})