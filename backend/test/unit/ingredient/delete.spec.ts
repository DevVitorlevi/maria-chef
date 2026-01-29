import { beforeEach, describe, expect, it } from "vitest";
import { Ingrediente } from "../../../src/generated/prisma/client";
import { CategoriaIngrediente, CategoriaPrato } from "../../../src/generated/prisma/enums";
import { DeleteIngredientUseCase } from "../../../src/use-cases/ingredient/Delete";
import { InMemoryDishRepository } from "../../in-memory/in-memory-dish-repository";
import { InMemoryIngredientRepository } from "../../in-memory/in-memory-ingredient-repository";
describe("Delete Ingredient Use Case", () => {
  let ingredientRepository: InMemoryIngredientRepository
  let dishRepository: InMemoryDishRepository
  let sut: DeleteIngredientUseCase

  beforeEach(() => {
    ingredientRepository = new InMemoryIngredientRepository()
    dishRepository = new InMemoryDishRepository()
    sut = new DeleteIngredientUseCase(ingredientRepository, dishRepository)
  })

  describe("Delete Ingredient Use Case", () => {
    let ingredientRepository: InMemoryIngredientRepository
    let dishRepository: InMemoryDishRepository
    let sut: DeleteIngredientUseCase

    beforeEach(() => {
      ingredientRepository = new InMemoryIngredientRepository()
      dishRepository = new InMemoryDishRepository()
      sut = new DeleteIngredientUseCase(ingredientRepository, dishRepository)
    })

    it("should be able to delete an ingredient from the dish", async () => {
      const prato = await dishRepository.create({
        nome: "Panqueca De Chocolate",
        categoria: CategoriaPrato.CAFE_MANHA,
        ingredientes: { create: [] },
      })

      const [ingrediente1, ingrediente2, ingrediente3] = await Promise.all([
        ingredientRepository.create(prato.id, {
          nome: "Farinha de Trigo",
          quantidade: 200,
          unidade: "g",
          categoria: CategoriaIngrediente.GRAOS,
        }),

        ingredientRepository.create(prato.id, {
          nome: "Leite",
          quantidade: 250,
          unidade: "ml",
          categoria: CategoriaIngrediente.LATICINIO,
        }),

        ingredientRepository.create(prato.id, {
          nome: "Ovos",
          quantidade: 2,
          unidade: "unidades",
          categoria: CategoriaIngrediente.PROTEINA,
        })
      ])

      prato.ingredientes = [ingrediente1, ingrediente2, ingrediente3]

      await sut.execute({
        dishId: prato.id,
        ingredientId: ingrediente1.id,
      })

      const ingredientesRestantes: Ingrediente[] = ingredientRepository.ingredients.filter(
        i => i.pratoId === prato.id
      )

      expect(ingredientesRestantes).toHaveLength(2)
      expect(
        ingredientesRestantes.some(i => i.id === ingrediente1.id)
      ).toBe(false)
    })
  })
})