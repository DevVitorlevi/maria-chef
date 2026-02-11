import { CategoriaIngrediente, CategoriaPrato, TipoRefeicao } from "@/generated/prisma/enums"
import { AcceptVariationUseCase } from "@/use-cases/menu-ai/accept-variation"
import { beforeEach, describe, expect, it } from "vitest"
import { InMemoryDishRepository } from "../../in-memory/in-memory-dish-repository"
import { InMemoryIngredientRepository } from "../../in-memory/in-memory-ingredient-repository"
import { InMemoryMealRepository } from "../../in-memory/in-memory-meal-repository"
import { InMemoryMenuRepository } from "../../in-memory/in-memory-menu-repository"

describe("Accept Variation Use Case", () => {
  let menuRepository: InMemoryMenuRepository
  let mealRepository: InMemoryMealRepository
  let dishRepository: InMemoryDishRepository
  let ingredientRepository: InMemoryIngredientRepository
  let sut: AcceptVariationUseCase
  let suggestionData: any

  beforeEach(() => {
    menuRepository = new InMemoryMenuRepository()
    mealRepository = new InMemoryMealRepository()
    dishRepository = new InMemoryDishRepository()
    ingredientRepository = new InMemoryIngredientRepository()

    sut = new AcceptVariationUseCase(
      mealRepository,
      menuRepository,
      dishRepository,
      ingredientRepository
    )

    suggestionData = {
      nome: 'Maminha Grelhada com Azeitonas e Ervas',
      categoria: CategoriaPrato.ALMOCO,
      ingredientes: [
        {
          nome: 'Maminha',
          quantidade: 1,
          unidade: 'kg',
          categoria: CategoriaIngrediente.PROTEINA
        },
        {
          nome: 'Azeite',
          quantidade: 30,
          unidade: 'ml',
          categoria: CategoriaIngrediente.TEMPERO
        },
        {
          nome: 'Azeitona',
          quantidade: 30,
          unidade: 'g',
          categoria: CategoriaIngrediente.TEMPERO
        },
        {
          nome: 'Sal marinho',
          quantidade: 10,
          unidade: 'g',
          categoria: CategoriaIngrediente.TEMPERO
        },
        {
          nome: 'Pimenta preta',
          quantidade: 5,
          unidade: 'g',
          categoria: CategoriaIngrediente.TEMPERO
        }
      ]
    }
  })

  it("should be able keep another dishes on meal when replace only one", async () => {
    const menu = await menuRepository.create({
      title: "Cardapio Maria",
      adults: 2,
      checkIn: new Date("2026-02-01"),
      checkOut: new Date("2026-02-05"),
      restricoes: [],
    })

    const pratoParaTrocar = await dishRepository.create({
      nome: "Carne de Sol",
      categoria: CategoriaPrato.ALMOCO
    })
    const acompanhamento1 = await dishRepository.create({
      nome: "Arroz de Leite",
      categoria: CategoriaPrato.ALMOCO
    })
    const acompanhamento2 = await dishRepository.create({
      nome: "Feijão Verde",
      categoria: CategoriaPrato.ALMOCO
    })

    const meal = await mealRepository.create({
      menuId: menu.id,
      type: TipoRefeicao.ALMOCO,
      date: new Date("2026-02-01"),
      dishes: [pratoParaTrocar.id, acompanhamento1.id, acompanhamento2.id]
    })

    await sut.execute(
      { sugestaoEscolhida: suggestionData },
      { menuId: menu.id, mealId: meal.id, oldPlateId: pratoParaTrocar.id }
    )

    const mealOn = await mealRepository.findById({ id: meal.id, menuId: menu.id })
    const idsResultantes = mealOn.meal.pratos.map((p: { id: any }) => p.id)

    expect(idsResultantes).toHaveLength(3)
    expect(idsResultantes).toContain(acompanhamento1.id)
    expect(idsResultantes).toContain(acompanhamento2.id)
    expect(idsResultantes).not.toContain(pratoParaTrocar.id)
  })

  it("should not be able to change a meal if the oldPlateId is not present", async () => {
    const menu = await menuRepository.create({
      title: "Cardapio Maria",
      adults: 2,
      checkIn: new Date("2026-02-01"),
      checkOut: new Date("2026-02-05"),
      restricoes: [],
    })

    const pratoExistente = await dishRepository.create({
      nome: "Prato Real",
      categoria: CategoriaPrato.ALMOCO
    })

    const meal = await mealRepository.create({
      menuId: menu.id,
      type: TipoRefeicao.ALMOCO,
      date: new Date(),
      dishes: [pratoExistente.id]
    })

    await sut.execute(
      { sugestaoEscolhida: suggestionData },
      { menuId: menu.id, mealId: meal.id, oldPlateId: "fake-id" }
    )

    const mealNoRepo = await mealRepository.findById({ id: meal.id, menuId: menu.id })
    const ids = mealNoRepo?.meal.pratos.map((p: { id: any }) => p.id)

    expect(ids).toContain(pratoExistente.id)
    expect(ids?.length).toBe(2)
  })
})