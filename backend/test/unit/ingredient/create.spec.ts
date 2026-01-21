import { beforeEach, describe, expect, it } from "vitest";
import { CategoriaIngrediente, CategoriaPrato, } from "../../../src/generated/prisma/enums";
import { CreateIngredientUseCase } from "../../../src/use-cases/ingredient/create";
import { ResourceNotFoundError } from "../../../src/utils/errors/resource-not-found-error";
import { InMemoryDishRepository } from "../../in-memory/in-memory-dish-repository";
import { InMemoryIngredientRepository } from "../../in-memory/in-memory-ingredient-repository";

describe("Create Ingredient Use Case", () => {
  let ingredientRepository: InMemoryIngredientRepository
  let dishRepository: InMemoryDishRepository
  let sut: CreateIngredientUseCase

  beforeEach(() => {
    ingredientRepository = new InMemoryIngredientRepository()
    dishRepository = new InMemoryDishRepository()
    sut = new CreateIngredientUseCase(ingredientRepository, dishRepository)
  })

  it("should be able to add an ingredient to the dish", async () => {
    const dish = await dishRepository.create({
      nome: "Panqueca De Chocolate",
      categoria: CategoriaPrato.CAFE_MANHA,
    })

    const { ingredient } = await sut.execute(dish.id, {
      nome: "Chocolate",
      quantidade: 100,
      unidade: "g",
      categoria: CategoriaIngrediente.OUTROS,
    })

    expect(ingredient).toBeTruthy()
    expect(ingredientRepository.ingredients).toHaveLength(1)
  })

  it("should not add an ingredient to a non-existent dish", async () => {
    await expect(
      sut.execute("dish-non-existent", {
        nome: "Chocolate",
        quantidade: 100,
        unidade: "g",
        categoria: CategoriaIngrediente.OUTROS,
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})