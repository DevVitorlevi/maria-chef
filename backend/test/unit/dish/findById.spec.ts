import { beforeEach, describe, expect, it } from "vitest"
import { CategoriaIngrediente, CategoriaPrato } from "../../../src/generated/prisma/enums"
import { FindByIdDishUseCase } from "../../../src/use-cases/dish/findById"
import { InMemoryDishRepository } from "../../in-memory/in-memory-dish-repository"
import { ResourceNotFoundError } from "../../../src/utils/errors/resource-not-found-error"
describe("Find By Id Dish Use Case", () => {
  let dishRepository: InMemoryDishRepository
  let sut: FindByIdDishUseCase

  beforeEach(() => {
    dishRepository = new InMemoryDishRepository()
    sut = new FindByIdDishUseCase(dishRepository)
  })

  it("should be able to find a prato by id", async () => {
    const createdDish = await dishRepository.create({
      nome: "Feijoada",
      categoria: CategoriaPrato.ALMOCO,
    })

    const { dish } = await sut.execute({ id: createdDish.id })

    expect(dish.id).toBe(createdDish.id)
    expect(dish.nome).toBe("Feijoada")
    expect(dish.categoria).toBe(CategoriaPrato.ALMOCO)
  })

  it("should not be able to find a prato with invalid id", async () => {
    await expect(() =>
      sut.execute({ id: "invalid-id" })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})