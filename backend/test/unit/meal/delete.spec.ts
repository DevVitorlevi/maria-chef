import { beforeEach, describe, expect, it } from "vitest";
import { CategoriaIngrediente, CategoriaPrato, TipoRefeicao } from "../../../src/generated/prisma/enums";
import { DeleteMealUseCase } from "../../../src/use-cases/meal/delete";
import { ResourceNotFoundError } from "../../../src/utils/errors/resource-not-found-error";
import { InMemoryDishRepository } from "../../in-memory/in-memory-dish-repository";
import { InMemoryIngredientRepository } from "../../in-memory/in-memory-ingredient-repository";
import { InMemoryMealRepository } from "../../in-memory/in-memory-meal-repository";
import { InMemoryMenuRepository } from "../../in-memory/in-memory-menu-repository";

describe("Delete Meal Use Case", () => {
  let menuRepository: InMemoryMenuRepository
  let mealRepository: InMemoryMealRepository
  let ingredientRepository: InMemoryIngredientRepository
  let dishRepository: InMemoryDishRepository
  let sut: DeleteMealUseCase

  beforeEach(() => {
    dishRepository = new InMemoryDishRepository()
    ingredientRepository = new InMemoryIngredientRepository()
    mealRepository = new InMemoryMealRepository(dishRepository)
    menuRepository = new InMemoryMenuRepository(mealRepository)

    sut = new DeleteMealUseCase(mealRepository, menuRepository)
  })

  it("should be able to delete meal", async () => {
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

    const menu = await menuRepository.create({
      title: "Cardapio Maria",
      checkIn: new Date("2026-02-01"),
      checkOut: new Date("2026-02-05"),
      adults: 2,
      kids: 1,
      restricoes: ["sem lactose"],
      preferencias: "Prefere comidas leves"
    })

    const meal = await mealRepository.create({
      menuId: menu.id,
      date: new Date("2026-02-02"),
      type: TipoRefeicao.ALMOCO,
      dishes: [dish.id]
    })

    await sut.execute({ id: meal.id, menuId: menu.id })

    const menuAfterDelete = await menuRepository.findById(menu.id)
    const mealStillExists = menuAfterDelete.refeicoes?.some((m: { id: any; }) => m.id === meal.id)

    expect(mealStillExists).toBe(false)
  })
  it("should not be able to delete a meal in an menu non-existent", async () => {
    await expect(
      sut.execute(
        { id: "non-existent-meal", menuId: "non-existent-menu" }
      )
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})