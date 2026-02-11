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
      ingredientRepository,
    )
  })

  it('should persist the new dish and ingredients in the database and update the meal', async () => {
    const menu = await menuRepository.create({
      title: 'Menu Maria',
      adults: 2,
      restricoes: ['sem_lactose'],
      preferencias: 'Frutos do mar',
      checkIn: new Date('2026-03-01'),
      checkOut: new Date('2026-03-05'),
    })

    const dish = await dishRepository.create({
      nome: `Prato Base ${Math.random()}`,
      categoria: CategoriaPrato.ALMOCO,
    })

    await ingredientRepository.create(dish.id, {
      nome: `Macarrão ${Math.random()}`,
      quantidade: 400,
      unidade: 'g',
      categoria: CategoriaIngrediente.OUTROS,
    })

    const meal = await mealRepository.create({
      menuId: menu.id,
      date: new Date('2026-03-01'),
      type: TipoRefeicao.ALMOCO,
      dishes: [dish.id],
    })

    const suggestsVariation = await menuAiRepository.variations(
      dish.nome,
      {
        contexto: {
          tipo: meal.tipo,
          preferencias: menu.preferencias ?? '',
          restricoes: menu.restricoes,
        },
      },
    )

    expect(suggestsVariation.dishes.length).toBeGreaterThan(0)

    const chosenVariation = suggestsVariation.dishes[0]

    console.log('Variação Real da IA:', chosenVariation?.nome)

    await sut.execute(
      {
        sugestaoEscolhida: {
          nome: chosenVariation!.nome,
          categoria: chosenVariation?.categoria as CategoriaPrato,
          ingredientes: chosenVariation!.ingredientes.map((ing) => ({
            nome: ing.nome,
            quantidade: ing.quantidade,
            unidade: ing.unidade,
            categoria: ing.categoria as CategoriaIngrediente,
          })),
        },
      },
      {
        menuId: menu.id,
        mealId: meal.id,
        oldPlateId: dish.id,
      },
    )

    const updatedMenu = await menuRepository.findById(menu.id)
    expect(updatedMenu).toBeTruthy()

    const mealAtualizada = updatedMenu!.refeicoes.find(r => r.id === meal.id)
    expect(mealAtualizada).toBeTruthy()

    expect(mealAtualizada?.pratos[0]?.nome).toBe(chosenVariation?.nome)

    const newDishId = mealAtualizada?.pratos[0]?.id

    const dishWithIngredients = await dishRepository.findById({
      dishId: newDishId!,
    })

    expect(dishWithIngredients).toBeTruthy()
    expect(dishWithIngredients!.ingredientes.length).toBeGreaterThan(0)
  }, 60000)
})
