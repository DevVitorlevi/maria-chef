import { beforeEach, describe, expect, it } from "vitest";
import { CategoriaIngrediente, CategoriaPrato } from "../../../src/generated/prisma/enums";
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
    const prato = await dishRepository.create({
      nome: "Panqueca De Chocolate",
      categoria: CategoriaPrato.CAFE_MANHA,
      ingredientes: {
        create: [
          {
            nome: "Farinha de Trigo",
            quantidade: 200,
            unidade: "g",
            categoria: CategoriaIngrediente.GRAOS,
          },
          {
            nome: "Leite",
            quantidade: 250,
            unidade: "ml",
            categoria: CategoriaIngrediente.LATICINIO,
          },
          {
            nome: "Ovos",
            quantidade: 2,
            unidade: "unidades",
            categoria: CategoriaIngrediente.PROTEINA,
          },
        ],
      },
    })

    const { ingredient } = await sut.execute({
      nome: "Chocolate",
      quantidade: 100,
      unidade: "g",
      categoria: CategoriaIngrediente.OUTROS,
      dishId: prato.id,
    })

    expect(ingredient).toBeTruthy()
    expect(ingredient.pratoId).toBe(prato.id)
    expect(ingredientRepository.ingredients).toHaveLength(1)
  })

  it("should not add an ingredient to a non-existent dish", async () => {
    await expect(
      sut.execute({
        nome: "Chocolate",
        quantidade: 100,
        unidade: "g",
        categoria: CategoriaIngrediente.OUTROS,
        dishId: "dish-non-existent",
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})