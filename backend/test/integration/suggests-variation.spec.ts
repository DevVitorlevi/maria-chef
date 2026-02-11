import { CategoriaIngrediente, CategoriaPrato, TipoRefeicao } from "@/generated/prisma/enums"
import { PrismaDishRepository } from "@/repositories/prisma/prisma-dish-repository"
import { PrismaIngredientRepository } from "@/repositories/prisma/prisma-ingredient-repository"
import { PrismaMealRepository } from "@/repositories/prisma/prisma-meal-repository"
import { SuggestsVariationUseCase } from "@/use-cases/menu-ai/suggests-variation"
import { PrismaMenuAIRepository } from "@repositories/prisma/prisma-menu-ai-repository"
import { PrismaMenuRepository } from "@repositories/prisma/prisma-menu-repository"
import { config } from "dotenv"
import { setupE2E } from "test/utils/setup-e2e"
import { beforeAll, beforeEach, describe, expect, it } from "vitest"

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
    await setupE2E()
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

    const result = await suggestsVariationUseCase.execute(
      {
        menuId: menu.id,
        pratoOriginal: dish.nome,
      },
      { contexto: { tipo: meal.tipo, restricoes: menu.restricoes, preferencias: menu.preferencias ?? "" } }
    )

    console.log("--- RESULTADO CENÁRIO NORMAL ---")
    console.log("Título:", result.categoria)
    console.log("Sugestões:", result.dishes.map(d => d.nome))

    expect(result.categoria).toContain("Maminha Grelhada")

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

    const result = await suggestsVariationUseCase.execute(
      {
        menuId: menu.id,
        pratoOriginal: dish.nome
      },
      { contexto: { tipo: meal.tipo, restricoes: menu.restricoes, preferencias: menu.preferencias ?? "" } }
    )

    console.log("--- RESULTADO CENÁRIO VEGETARIANO ---")
    console.log("Título:", result.categoria)
    console.log("Sugestões:", result.dishes.map(d => d.nome))

    const firstDish = result.dishes[0]
    expect(firstDish?.ingredientes.length).toBeGreaterThan(0)
  }, 60000)
})