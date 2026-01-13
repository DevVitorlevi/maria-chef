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

    const { prato } = await sut.execute({ id: createdDish.id })

    expect(prato.id).toBe(createdDish.id)
    expect(prato.nome).toBe("Feijoada")
    expect(prato.categoria).toBe(CategoriaPrato.ALMOCO)
  })

  it("should be able to find a prato with ingredients", async () => {
    const createdDish = await dishRepository.create({
      nome: "Feijoada",
      categoria: CategoriaPrato.ALMOCO,
      ingredientes: {
        create: [
          {
            nome: "Feijão preto",
            quantidade: 500,
            unidade: "g",
            categoria: CategoriaIngrediente.GRAOS,
          },
          {
            nome: "Linguiça",
            quantidade: 300,
            unidade: "g",
            categoria: CategoriaIngrediente.PROTEINA,
          },
        ],
      },
    })

    const { prato } = await sut.execute({ id: createdDish.id })

    expect(prato.ingredientes).toHaveLength(2)
    expect(prato.ingredientes[0].nome).toBe("Feijão preto")
    expect(prato.ingredientes[1].nome).toBe("Linguiça")
  })

  it("should not be able to find a prato with invalid id", async () => {
    await expect(() =>
      sut.execute({ id: "invalid-id" })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it("should return empty ingredients array when prato has no ingredients", async () => {
    const createdDish = await dishRepository.create({
      nome: "Salada Simples",
      categoria: CategoriaPrato.ALMOCO,
    })

    const { prato } = await sut.execute({ id: createdDish.id })

    expect(prato.ingredientes).toHaveLength(0)
    expect(prato.ingredientes).toEqual([])
  })
})