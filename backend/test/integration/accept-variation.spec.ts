import { CategoriaIngrediente, CategoriaPrato, TipoRefeicao } from '@/generated/prisma/enums'
import { PrismaDishRepository } from '@/repositories/prisma/prisma-dish-repository'
import { PrismaIngredientRepository } from '@/repositories/prisma/prisma-ingredient-repository'
import { PrismaMealRepository } from '@/repositories/prisma/prisma-meal-repository'
import { PrismaMenuAIRepository } from '@/repositories/prisma/prisma-menu-ai-repository'
import { PrismaMenuRepository } from '@/repositories/prisma/prisma-menu-repository'
import { AcceptVariationUseCase } from '@/use-cases/menu-ai/accept-variation'
import { setupE2E } from 'test/utils/setup-e2e'
import { beforeEach, describe, expect, it } from 'vitest'

describe('Accept Variation Use Case (Integration)', () => {
  let menuRepository: PrismaMenuRepository
  let mealRepository: PrismaMealRepository
  let dishRepository: PrismaDishRepository
  let ingredientRepository: PrismaIngredientRepository
  let menuAiRepository: PrismaMenuAIRepository
  let sut: AcceptVariationUseCase


  beforeEach(async () => {
    await setupE2E()

    menuRepository = new PrismaMenuRepository()
    mealRepository = new PrismaMealRepository()
    dishRepository = new PrismaDishRepository()
    ingredientRepository = new PrismaIngredientRepository()
    menuAiRepository = new PrismaMenuAIRepository()

    sut = new AcceptVariationUseCase(
      mealRepository,
      menuRepository,
      dishRepository,
      ingredientRepository
    )
  })

  it('should persist the new dish and ingredients in the database and update the meal', async () => {
    const menu = await menuRepository.create({
      title: "Menu Maria",
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

    const meal = await mealRepository.create({
      menuId: menu.id,
      date: new Date("2026-03-01"),
      type: TipoRefeicao.ALMOCO,
      dishes: [dish.id]
    })


    const suggestsVariation = await menuAiRepository.variations({
      pratoOriginal: dish.nome,
      contexto: {
        tipo: meal.tipo,
        preferencias: menu.preferencias ?? "",
        restricoes: menu.restricoes
      }
    })

    const chosenVariation = suggestsVariation.dishes[0]
    console.log("Variacao Escolhida", chosenVariation)
    if (!chosenVariation) {
      throw new Error("AI did not return any dishes")
    }

    await sut.execute(
      {
        menuId: menu.id,
        sugestaoEscolhida: chosenVariation
      },
      {
        menuId: menu.id,
        mealId: meal.id,
        oldPlateId: meal.pratos[0]!.id,
      },
    )

    const updatedMenu = await menuRepository.findById(menu.id)

    expect(updatedMenu?.refeicoes).toHaveLength(1)
    expect(updatedMenu?.refeicoes[0]?.pratos[0]?.nome).toBe(chosenVariation.nome)
  })

  it('should throw ResourceNotFoundError if meal does not exist', async () => {
    const input = {
      menuId: 'any-id',
      sugestaoEscolhida: {
        nome: 'Prato Erro',
        categoria: CategoriaPrato.ALMOCO,
        ingredientes: []
      }
    }

    const params = {
      menuId: 'invalid-menu',
      mealId: 'invalid-meal',
      oldPlateId: 'invalid-plate'
    }

    await expect(sut.execute(input, params)).rejects.toThrow()
  })
})