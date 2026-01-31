import { beforeEach, describe, expect, it } from "vitest";
import { CategoriaIngrediente, CategoriaPrato, TipoRefeicao } from "../../../src/generated/prisma/enums";
import { DeleteMenuUseCase } from "../../../src/use-cases/menu/delete";
import { ResourceNotFoundError } from "../../../src/utils/errors/resource-not-found-error";
import { InMemoryDishRepository } from "../../in-memory/in-memory-dish-repository";
import { InMemoryIngredientRepository } from "../../in-memory/in-memory-ingredient-repository";
import { InMemoryMealRepository } from "../../in-memory/in-memory-meal-repository";
import { InMemoryMenuRepository } from "../../in-memory/in-memory-menu-repository";

describe("Delete Menu Use Case", () => {
  let menuRepository: InMemoryMenuRepository
  let mealRepository: InMemoryMealRepository
  let ingredientRepository: InMemoryIngredientRepository
  let dishRepository: InMemoryDishRepository
  let sut: DeleteMenuUseCase

  beforeEach(() => {
    dishRepository = new InMemoryDishRepository()
    ingredientRepository = new InMemoryIngredientRepository()
    menuRepository = new InMemoryMenuRepository()
    mealRepository = new InMemoryMealRepository(dishRepository)

    sut = new DeleteMenuUseCase(menuRepository)
  })

  it("should be able to find all menus", async () => {
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

    const [menuMaria] = await Promise.all([
      menuRepository.create({
        title: "Cardapio Maria",
        checkIn: new Date("2026-02-10"),
        checkOut: new Date("2026-02-25"),
        adults: 2,
        kids: 1,
        restricoes: ["sem lactose"],
        preferencias: "Prefere comidas leves"
      }),
    ])

    await Promise.all([
      mealRepository.create({
        menuId: menuMaria.id,
        date: new Date("2026-02-02"),
        type: TipoRefeicao.ALMOCO,
        dishes: [dish.id]
      })
    ])

    await sut.execute({ id: menuMaria.id })

    const menuAfterDelete = await menuRepository.findById(menuMaria.id)

    expect(menuAfterDelete).toBeNull()
  })

  it("should not be able to delete a menu that non-existent", async () => {
    await expect(
      sut.execute({ id: "non-existent" })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})