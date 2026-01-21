import { beforeEach, describe, expect, it } from "vitest";
import { CategoriaPrato } from "../../../src/generated/prisma/enums";
import { FindAllDishUseCase } from "../../../src/use-cases/dish/findAll";
import { InMemoryDishRepository } from "../../in-memory/in-memory-dish-repository";
describe("Find All dishes Use Case", () => {
  let dishRepository: InMemoryDishRepository
  let sut: FindAllDishUseCase

  beforeEach(() => {
    dishRepository = new InMemoryDishRepository()
    sut = new FindAllDishUseCase(dishRepository)
  })

  it("should be able to list all dishes", async () => {
    await dishRepository.create({
      nome: "Tapioca de queijo",
      categoria: CategoriaPrato.CAFE_MANHA,
    })

    await dishRepository.create({
      nome: "Arroz branco",
      categoria: CategoriaPrato.ALMOCO,
    })

    const { dishes } = await sut.execute({})

    expect(dishes).toHaveLength(2)
  })

  it("should return empty array when there are no dishes", async () => {
    const { dishes } = await sut.execute({})

    expect(dishes).toEqual([])
    expect(dishes).toHaveLength(0)
  })

  it("should filter dishes by nome", async () => {
    await dishRepository.create({
      nome: "Tapioca de queijo",
      categoria: CategoriaPrato.CAFE_MANHA,
    })

    await dishRepository.create({
      nome: "Tapioca doce",
      categoria: CategoriaPrato.SOBREMESA,
    })

    await dishRepository.create({
      nome: "Ovo mexido",
      categoria: CategoriaPrato.CAFE_MANHA,
    })

    const { dishes } = await sut.execute({ nome: "tapioca" })

    expect(dishes).toHaveLength(2)
    expect(dishes).toEqual([
      expect.objectContaining({ nome: "Tapioca de queijo" }),
      expect.objectContaining({ nome: "Tapioca doce" }),
    ])
  })

  it("should filter dishes by nome term with different cases", async () => {
    await dishRepository.create({
      nome: "Tapioca de queijo",
      categoria: CategoriaPrato.CAFE_MANHA,
    })

    const result1 = await sut.execute({ nome: "TAPIOCA" })
    expect(result1.dishes).toHaveLength(1)

    const result2 = await sut.execute({ nome: "tapioca" })
    expect(result2.dishes).toHaveLength(1)

    const result3 = await sut.execute({ nome: "TaPiOcA" })
    expect(result3.dishes).toHaveLength(1)
  })

  it("should filter dishes by categoria", async () => {
    await dishRepository.create({
      nome: "Tapioca de queijo",
      categoria: CategoriaPrato.CAFE_MANHA,
    })

    await dishRepository.create({
      nome: "Ovo mexido",
      categoria: CategoriaPrato.CAFE_MANHA,
    })

    await dishRepository.create({
      nome: "Arroz branco",
      categoria: CategoriaPrato.ALMOCO,
    })

    await dishRepository.create({
      nome: "Pudim",
      categoria: CategoriaPrato.SOBREMESA,
    })

    const { dishes } = await sut.execute({ categoria: CategoriaPrato.CAFE_MANHA })

    expect(dishes).toHaveLength(2)
    expect(dishes).toEqual([
      expect.objectContaining({ categoria: CategoriaPrato.CAFE_MANHA }),
      expect.objectContaining({ categoria: CategoriaPrato.CAFE_MANHA }),
    ])
  })

  it("should combine nome and categoria filters", async () => {
    await dishRepository.create({
      nome: "Tapioca de queijo",
      categoria: CategoriaPrato.CAFE_MANHA,
    })

    await dishRepository.create({
      nome: "Tapioca doce",
      categoria: CategoriaPrato.SOBREMESA,
    })

    await dishRepository.create({
      nome: "Ovo mexido",
      categoria: CategoriaPrato.CAFE_MANHA,
    })

    const { dishes } = await sut.execute({
      nome: "tapioca",
      categoria: CategoriaPrato.CAFE_MANHA,
    })

    expect(dishes).toHaveLength(1)
    expect(dishes[0].nome).toBe("Tapioca de queijo")
  })

  it("should return empty array when no dishes match filters", async () => {
    await dishRepository.create({
      nome: "Tapioca de queijo",
      categoria: CategoriaPrato.CAFE_MANHA,
    })

    const { dishes } = await sut.execute({ nome: "pizza" })

    expect(dishes).toEqual([])
    expect(dishes).toHaveLength(0)
  })
})