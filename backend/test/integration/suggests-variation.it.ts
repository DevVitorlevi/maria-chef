import { PrismaDishRepository } from "@/repositories/prisma/prisma-dish-repository"
import { PrismaIngredientRepository } from "@/repositories/prisma/prisma-ingredient-repository"
import { PrismaMealRepository } from "@/repositories/prisma/prisma-meal-repository"
import { config } from "dotenv"
import { beforeAll, beforeEach, describe, expect, it } from "vitest"
import { CategoriaIngrediente, CategoriaPrato, TipoRefeicao } from "../../src/generated/prisma/enums"
import { prisma } from "../../src/lib/prisma"
import { PrismaMenuAIRepository } from "../../src/repositories/prisma/prisma-menu-ai-repository"
import { PrismaMenuRepository } from "../../src/repositories/prisma/prisma-menu-repository"
import { SuggestsVariationUseCase } from "../../src/use-cases/menu-ai/suggests-variation"

config()

describe("Menu AI Suggest Variations Integration", () => {
  let suggestsVariationUseCase: SuggestsVariationUseCase
  let menuRepository: PrismaMenuRepository
  let dishRepository: PrismaDishRepository
  let mealRepository: PrismaMealRepository
  let ingredientRepository: PrismaIngredientRepository
  let menuAiRepository: PrismaMenuAIRepository

  beforeAll(() => {
    menuRepository = new PrismaMenuRepository()
    mealRepository = new PrismaMealRepository()
    dishRepository = new PrismaDishRepository()
    ingredientRepository = new PrismaIngredientRepository()
    menuAiRepository = new PrismaMenuAIRepository()
    suggestsVariationUseCase = new SuggestsVariationUseCase(menuAiRepository, menuRepository)
  })

  beforeEach(async () => {
    await prisma.ingrediente.deleteMany()
    await prisma.prato.deleteMany()
    await prisma.refeicao.deleteMany()
    await prisma.cardapio.deleteMany()
  })

  it("should be able suggests variations", async () => {
    const menu = await menuRepository.create({
      title: "Menu Gourmet Sem Restrições",
      adults: 2,
      restricoes: [],
      preferencias: "Carnes nobres e frutos do mar",
      checkIn: new Date("2026-05-10"),
      checkOut: new Date("2026-05-15"),
    })

    const dish = await dishRepository.create({
      nome: "Maminha Grelhada",
      categoria: CategoriaPrato.ALMOCO,
    })

    await Promise.all([
      ingredientRepository.create(dish.id, {
        nome: "Maminha",
        quantidade: 1,
        unidade: "kg",
        categoria: CategoriaIngrediente.PROTEINA
      }),
      ingredientRepository.create(dish.id, {
        nome: "Sal Grosso",
        quantidade: 40,
        unidade: "g",
        categoria: CategoriaIngrediente.TEMPERO
      })
    ])

    const meal = await mealRepository.create({
      menuId: menu.id,
      date: new Date("2026-02-10"),
      type: TipoRefeicao.ALMOCO,
      dishes: [dish.id]
    })

    const result = await suggestsVariationUseCase.execute({
      menuId: menu.id,
      pratoOriginal: dish.nome,
      contexto: { tipo: meal.tipo, restricoes: menu.restricoes, preferencias: menu.preferencias ?? "" }
    })

    console.log("--- RESULTADO CENÁRIO NORMAL ---")
    console.log("Título:", result.categoria)
    console.log("Sugestões:", result.dishes.map(d => d.nome))

    expect(result.dishes.length).toBeGreaterThanOrEqual(3)
    expect(result.categoria).toContain("Maminha Grelhada")

    const hasSpecificCuts = result.dishes.some(d =>
      d.nome.toLowerCase().includes("picanha") ||
      d.nome.toLowerCase().includes("filé") ||
      d.nome.toLowerCase().includes("lombo")
    )
    expect(hasSpecificCuts).toBe(true)
  }, 60000)

  it("should not be able suggests variations that not be vegetarian", async () => {
    const menu = await menuRepository.create({
      title: "Menu Estritamente Vegetariano",
      adults: 2,
      restricoes: ["vegetariano", "sem_carne_vermelha"],
      preferencias: "Comida natural e cogumelos",
      checkIn: new Date("2026-05-10"),
      checkOut: new Date("2026-05-15"),
    })

    const dish = await dishRepository.create({
      nome: "Moqueca de Banana",
      categoria: CategoriaPrato.ALMOCO,
    })

    await Promise.all([
      ingredientRepository.create(dish.id, {
        nome: "Banana",
        quantidade: 1,
        unidade: "kg",
        categoria: CategoriaIngrediente.HORTIFRUTI
      }),
      ingredientRepository.create(dish.id, {
        nome: "Creme de Leite",
        quantidade: 400,
        unidade: "g",
        categoria: CategoriaIngrediente.LATICINIO
      })
    ])

    const meal = await mealRepository.create({
      menuId: menu.id,
      date: new Date("2026-02-10"),
      type: TipoRefeicao.ALMOCO,
      dishes: [dish.id]
    })

    const result = await suggestsVariationUseCase.execute({
      menuId: menu.id,
      pratoOriginal: dish.nome,
      contexto: { tipo: meal.tipo, restricoes: menu.restricoes, preferencias: menu.preferencias ?? "" }
    })

    console.log("--- RESULTADO CENÁRIO VEGETARIANO ---")
    console.log("Título:", result.categoria)
    console.log("Sugestões:", result.dishes.map(d => d.nome))

    const firstDish = result.dishes[0]
    expect(firstDish?.ingredientes.length).toBeGreaterThan(0)

    const veggieProteins = ["cogumelo", "grão de bico", "tofu", "feijão", "lentilha", "banana", "berinjela"]
    const isVeggieFriendly = result.dishes.some(d =>
      veggieProteins.some(vp => d.nome.toLowerCase().includes(vp))
    )
    expect(isVeggieFriendly).toBe(true)
  }, 60000)
})