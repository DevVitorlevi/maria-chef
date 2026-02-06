import { config } from "dotenv"
import { beforeEach, describe, expect, it } from "vitest"
import { Ingrediente } from "../../src/generated/prisma/client"
import { TipoRefeicao } from "../../src/generated/prisma/enums"
import { PrismaMenuAIRepository } from "../../src/repositories/prisma/prisma-menu-ai-repository"
import { AcceptMenuAISuggestionsUseCase } from "../../src/use-cases/menu-ai/accept-suggestions"
import { MenuAiSuggestsUseCase } from "../../src/use-cases/menu-ai/suggests"
import { InMemoryDishRepository } from "../in-memory/in-memory-dish-repository"
import { InMemoryIngredientRepository } from "../in-memory/in-memory-ingredient-repository"
import { InMemoryMealRepository } from "../in-memory/in-memory-meal-repository"
import { InMemoryMenuRepository } from "../in-memory/in-memory-menu-repository"

config()

describe("Menu AI Full Integration Test — Real Groq API", () => {
  let suggestsUseCase: MenuAiSuggestsUseCase
  let acceptUseCase: AcceptMenuAISuggestionsUseCase
  let menuRepository: InMemoryMenuRepository
  let aiRepository: PrismaMenuAIRepository
  let mealRepository: InMemoryMealRepository
  let dishRepository: InMemoryDishRepository
  let ingredientRepository: InMemoryIngredientRepository

  beforeEach(() => {
    const sharedIngredients: Ingrediente[] = []
    ingredientRepository = new InMemoryIngredientRepository(sharedIngredients)
    dishRepository = new InMemoryDishRepository(sharedIngredients)
    mealRepository = new InMemoryMealRepository(dishRepository)
    menuRepository = new InMemoryMenuRepository(mealRepository, dishRepository)

    aiRepository = new PrismaMenuAIRepository()

    suggestsUseCase = new MenuAiSuggestsUseCase(menuRepository, aiRepository)
    acceptUseCase = new AcceptMenuAISuggestionsUseCase(
      menuRepository,
      mealRepository,
      dishRepository,
      ingredientRepository
    )
  })

  it(
    "should complete full flow with real AI: coastal house menu flow",
    async () => {
      const menu = await menuRepository.create({
        title: "Temporada de Verão - Mansão das Falésias Icapuí",
        adults: 6,
        kids: 4,
        restricoes: ["sem_lactose", "Crianças não comem pimenta", "Evitar frituras pesadas"],
        preferencias: "Foco total em frutos do mar frescos da região, frutas tropicais e comidas leves para o pós-praia.",
        checkIn: new Date("2026-02-01"),
        checkOut: new Date("2026-02-10"),
      })


      const pratoExistente = await dishRepository.create({
        nome: "Peixada Cearense Tradicional",
        categoria: "ALMOCO" as any,
      })

      await mealRepository.create({
        menuId: menu.id,
        date: new Date("2026-02-01"),
        type: TipoRefeicao.ALMOCO,
        dishes: [pratoExistente.id],
      })


      const suggestions = await suggestsUseCase.execute(
        { menuId: menu.id },
        {
          type: TipoRefeicao.ALMOCO,
          date: new Date("2026-02-03"),
        }
      )

      suggestions.dishes.forEach((dish: { nome: any }, idx: number) => {
        console.log(`   ${idx + 1}. 🌴 ${dish.nome}`)
      })

      const hasRepeated = suggestions.dishes.some((d: { nome: string }) =>
        d.nome.toLowerCase().includes("peixada")
      )
      expect(hasRepeated).toBe(false)

      const dishesToAccept = suggestions.dishes.slice(0, 2)

      await acceptUseCase.execute({
        menuId: menu.id,
        date: new Date("2026-02-03"),
        type: TipoRefeicao.ALMOCO,
        dishes: dishesToAccept,
      })

      const menuUpdated = await menuRepository.findById(menu.id)
      expect(menuUpdated!.refeicoes).toHaveLength(2)

      const nextDaySuggestions = await suggestsUseCase.execute(
        { menuId: menu.id },
        {
          type: TipoRefeicao.ALMOCO,
          date: new Date("2026-02-04"),
        }
      )

      const acceptedNames = dishesToAccept.map((d: { nome: string }) => d.nome.toLowerCase())
      const isAnythingRepeated = nextDaySuggestions.dishes.some((d: { nome: string }) =>
        acceptedNames.includes(d.nome.toLowerCase())
      )

      expect(isAnythingRepeated).toBe(false)
    },
    60000
  )

  it(
    "should handle beach day full meals (Breakfast to Dinner)",
    async () => {
      const menu = await menuRepository.create({
        title: "Fim de Semana Pé na Areia",
        adults: 4,
        kids: 2,
        restricoes: ["Vegano"],
        preferencias: "Muitos sucos naturais e petiscos leves",
        checkIn: new Date("2026-03-01"),
        checkOut: new Date("2026-03-03"),
      })

      const testDate = new Date("2026-03-02")

      const types = [TipoRefeicao.CAFE, TipoRefeicao.ALMOCO, TipoRefeicao.JANTAR]

      for (const type of types) {
        const res = await suggestsUseCase.execute({ menuId: menu.id }, { type, date: testDate })
        await acceptUseCase.execute({
          menuId: menu.id,
          date: testDate,
          type,
          dishes: [res.dishes[0]],
        })
      }

      const finalMenu = await menuRepository.findById(menu.id)
      expect(finalMenu!.refeicoes).toHaveLength(3)
    },
    90000
  )
})