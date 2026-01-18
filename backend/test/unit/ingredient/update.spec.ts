import { beforeEach, describe, expect, it } from "vitest"
import { CategoriaIngrediente, CategoriaPrato } from "../../../src/generated/prisma/enums"
import { UpdateIngredientUseCase } from "../../../src/use-cases/ingredient/update"
import { ResourceNotFoundError } from "../../../src/utils/errors/resource-not-found-error"
import { InMemoryDishRepository } from "../../in-memory/in-memory-dish-repository"
import { InMemoryIngredientRepository } from "../../in-memory/in-memory-ingredient-repository"

describe("Update Ingredient Use Case", () => {
  let ingredientRepository: InMemoryIngredientRepository
  let dishRepository: InMemoryDishRepository
  let sut: UpdateIngredientUseCase

  beforeEach(() => {
    ingredientRepository = new InMemoryIngredientRepository()
    dishRepository = new InMemoryDishRepository()
    sut = new UpdateIngredientUseCase(ingredientRepository, dishRepository)
  })

  it("should be able to update an existing ingredient of a dish", async () => {
    const prato = await dishRepository.create({
      nome: "Panqueca de Chocolate",
      categoria: CategoriaPrato.CAFE_MANHA,
    })

    const ingredient = await ingredientRepository.create(prato.id, {
      nome: "Farinha",
      quantidade: 200,
      unidade: "g",
      categoria: CategoriaIngrediente.GRAOS,
    })

    const response = await sut.execute({
      ingredientId: ingredient.id,
      dishId: prato.id,
      nome: "Chocolate",
      quantidade: 100,
      unidade: "g",
      categoria: CategoriaIngrediente.OUTROS,
    })

    expect(response.ingredient).toBeTruthy()
    expect(response.ingredient?.id).toBe(ingredient.id)
    expect(response.ingredient?.nome).toBe("Chocolate")
    expect(response.ingredient?.quantidade.toNumber()).toBe(100)
    expect(response.ingredient?.categoria).toBe(CategoriaIngrediente.OUTROS)

    expect(ingredientRepository.ingredients).toHaveLength(1)
  })

  it("should not update an ingredient if dish does not exist", async () => {
    await expect(
      sut.execute({
        ingredientId: "ingredient-id",
        dishId: "dish-non-existent",
        nome: "Chocolate",
        quantidade: 100,
        unidade: "g",
        categoria: CategoriaIngrediente.OUTROS,
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it("should return null if ingredient does not exist in the dish", async () => {
    const prato = await dishRepository.create({
      nome: "Panqueca",
      categoria: CategoriaPrato.CAFE_MANHA,
    })

    const response = await sut.execute({
      ingredientId: "ingredient-non-existent",
      dishId: prato.id,
      nome: "Chocolate",
      quantidade: 100,
      unidade: "g",
      categoria: CategoriaIngrediente.OUTROS,
    })

    expect(response.ingredient).toBeNull()
  })
})
