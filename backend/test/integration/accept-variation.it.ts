import { PrismaMenuAIRepository } from "@/repositories/prisma/prisma-menu-ai-repository"
import { config } from "dotenv"
import { beforeEach, describe, expect, it } from "vitest"
import { CategoriaIngrediente, CategoriaPrato, TipoRefeicao } from "../../src/generated/prisma/enums"
import { prisma } from "../../src/lib/prisma"
import { PrismaDishRepository } from "../../src/repositories/prisma/prisma-dish-repository"
import { PrismaIngredientRepository } from "../../src/repositories/prisma/prisma-ingredient-repository"
import { PrismaMealRepository } from "../../src/repositories/prisma/prisma-meal-repository"
import { PrismaMenuRepository } from "../../src/repositories/prisma/prisma-menu-repository"
import { AcceptVariationUseCase } from "../../src/use-cases/menu-ai/accept-variation"

config()

describe("Menu AI Accept Variation Integration", () => {
  let sut: AcceptVariationUseCase
  let menuRepository: PrismaMenuRepository
  let dishRepository: PrismaDishRepository
  let mealRepository: PrismaMealRepository
  let ingredientRepository: PrismaIngredientRepository

  beforeEach(async () => {
    await prisma.ingrediente.deleteMany()
    await prisma.prato.deleteMany()
    await prisma.refeicao.deleteMany()
    await prisma.cardapio.deleteMany()

    menuRepository = new PrismaMenuRepository()
    mealRepository = new PrismaMealRepository()
    dishRepository = new PrismaDishRepository()
    ingredientRepository = new PrismaIngredientRepository()

    sut = new AcceptVariationUseCase(
      mealRepository,
      menuRepository,
      dishRepository,
      ingredientRepository
    )
  })

  it("should replace an existing dish with a new AI variation and persist the changes", async () => {
    const menu = await menuRepository.create({
      title: "Menu Maria",
      adults: 2,
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

    const sugestaoDaIA = {
      nome: "Pargo Assado com Batatas",
      categoria: CategoriaPrato.ALMOCO,
      ingredientes: [
        {
          nome: "Pargo",
          quantidade: 800,
          unidade: "g",
          categoria: CategoriaIngrediente.PROTEINA
        },
        {
          nome: "Batata Inglesa",
          quantidade: 3,
          unidade: "un",
          categoria: CategoriaIngrediente.HORTIFRUTI
        }
      ]
    }

    const result = await sut.execute(
      {
        menuId: menu.id,
        sugestaoEscolhida: sugestaoDaIA
      },
      {
        menuId: menu.id,
        mealId: meal.id,
        oldPlateId: dish.id
      }
    )

    expect(result.dish.nome).toBe("Pargo Assado com Batatas")
    expect(result.dish.id).toBeDefined()

    const updatedMeal = await prisma.refeicao.findUnique({
      where: { id: meal.id },
      include: { pratos: true }
    })

    const nomesDosPratos = updatedMeal?.pratos.map(p => p.nome)
    expect(nomesDosPratos).toContain("Pargo Assado com Batatas")
    expect(nomesDosPratos).not.toContain("Prato Antigo para Remover")

    const newDishWithIngredients = await dishRepository.findById({
      dishId: result.dish.id
    })

    expect(newDishWithIngredients?.ingredientes).toHaveLength(2)
    const nomesIngredientes = newDishWithIngredients?.ingredientes.map(i => i.nome)
    expect(nomesIngredientes).toContain("Pargo")
  })
})