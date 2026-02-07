import { PrismaMenuAIRepository } from "@/repositories/prisma/prisma-menu-ai-repository"
import { config } from "dotenv"
import { beforeEach, describe, expect, it } from "vitest"
import { CategoriaIngrediente, CategoriaPrato, TipoRefeicao } from "../../src/generated/prisma/enums"
import { prisma } from "../../src/lib/prisma"
import { PrismaDishRepository } from "../../src/repositories/prisma/prisma-dish-repository"
import { PrismaIngredientRepository } from "../../src/repositories/prisma/prisma-ingredient-repository"
import { PrismaMealRepository } from "../../src/repositories/prisma/prisma-meal-repository"
import { PrismaMenuRepository } from "../../src/repositories/prisma/prisma-menu-repository"
import { AcceptMenuAISuggestionsUseCase } from "../../src/use-cases/menu-ai/accept-suggestions"

config()

describe("Menu AI Accept Integration — Full Prisma Persistence", () => {
  let acceptUseCase: AcceptMenuAISuggestionsUseCase
  let menuRepository: PrismaMenuRepository
  let dishRepository: PrismaDishRepository
  let mealRepository: PrismaMealRepository
  let ingredientRepository: PrismaIngredientRepository
  let menuAiRespository: PrismaMenuAIRepository

  beforeEach(async () => {
    await prisma.ingrediente.deleteMany()
    await prisma.prato.deleteMany()
    await prisma.refeicao.deleteMany()
    await prisma.cardapio.deleteMany()

    menuRepository = new PrismaMenuRepository()
    mealRepository = new PrismaMealRepository()
    dishRepository = new PrismaDishRepository()
    ingredientRepository = new PrismaIngredientRepository()
    menuAiRespository = new PrismaMenuAIRepository()

    acceptUseCase = new AcceptMenuAISuggestionsUseCase(
      menuRepository,
      mealRepository,
      dishRepository,
      ingredientRepository
    )
  })

  it("should persist AI suggestions in the real database and fetch ingredients through the dish", async () => {
    const menu = await menuRepository.create({
      title: "Jantar Real Integration",
      adults: 2,
      restricoes: ["sem_lactose"],
      preferencias: "Frutos do mar",
      checkIn: new Date("2026-03-01"),
      checkOut: new Date("2026-03-05"),
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

    const aiSuggestions = await menuAiRespository.suggests(
      {
        type: TipoRefeicao.ALMOCO,
        date: new Date("2026-03-02")
      },
      {
        id: menu.id,
        title: menu.titulo,
        adults: menu.adultos,
        kids: menu.criancas ?? 0,
        restricoes: menu.restricoes,
        preferencias: menu.preferencias ?? "",
        checkin: menu.checkin,
        checkout: menu.checkout
      },
      []
    )

    expect(aiSuggestions.dishes.length).toBeGreaterThan(0)

    const suggestedNames = aiSuggestions.dishes.map(d => d.nome.toLowerCase())
    expect(suggestedNames).not.toContain("macarrão à bolonhesa")

    const chosenDish = aiSuggestions.dishes[0]
    if (!chosenDish) {
      throw new Error("AI did not return any dishes")
    }

    await acceptUseCase.execute({
      menuId: menu.id,
      date: new Date("2026-03-02"),
      type: TipoRefeicao.ALMOCO,
      dishes: [chosenDish],
    })

    const updatedMenu = await menuRepository.findById(menu.id)
    const meal = updatedMenu?.refeicoes[0]

    expect(meal?.pratos[0]?.nome).toBe(chosenDish.nome)

    const dishId = meal?.pratos[0]?.id
    expect(dishId).toBeDefined()

    const dishWithIngredients = await dishRepository.findById({
      dishId: dishId!
    })

    expect(dishWithIngredients?.ingredientes.length).toBe(chosenDish.ingredientes.length)

    const ingredientNames = dishWithIngredients?.ingredientes.map(i => i.nome)

    expect(ingredientNames).toContain(chosenDish.ingredientes[0]?.nome)
  }, 60000)
})