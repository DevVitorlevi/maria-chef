import { beforeEach, describe, expect, it } from "vitest"
import { FindAllDishUseCase } from "../../../src/use-cases/dish/findAll"
import { InMemoryDishRepository } from "../../in-memory/in-memory-dish-repository"

describe("Find All pratos Use Case", () => {
  let dishRepository: InMemoryDishRepository
  let sut: FindAllDishUseCase

  beforeEach(() => {
    dishRepository = new InMemoryDishRepository()
    sut = new FindAllDishUseCase(dishRepository)
  })

  it("should be able to list all pratos", async () => {
    await dishRepository.create({
      nome: "Tapioca de queijo",
      categoria: "CAFE_MANHA",
      ingredientes: {
        create: [
          {
            nome: "Goma de tapioca",
            quantidade: 100,
            unidade: "g",
            categoria: "GRAOS",
          },
        ],
      },
    })

    await dishRepository.create({
      nome: "Arroz branco",
      categoria: "ALMOCO",
      ingredientes: {
        create: [
          {
            nome: "Arroz",
            quantidade: 200,
            unidade: "g",
            categoria: "GRAOS",
          },
        ],
      },
    })

    const { pratos } = await sut.execute()

    expect(pratos).toHaveLength(2)
  })

  it("should return empty array when there are no pratos", async () => {
    const { pratos } = await sut.execute()

    expect(pratos).toEqual([])
    expect(pratos).toHaveLength(0)
  })

  // it("should return pratos ordered by name (A-Z)", async () => {
  //   await dishRepository.create({
  //     nome: "Zebra cake",
  //     categoria: "SOBREMESA",
  //     ingredientes: {
  //       create: [
  //         {
  //           nome: "Farinha",
  //           quantidade: 200,
  //           unidade: "g",
  //           categoria: "GRAOS",
  //         },
  //       ],
  //     },
  //   })

  //   await dishRepository.create({
  //     nome: "Abacaxi grelhado",
  //     categoria: "SOBREMESA",
  //     ingredientes: {
  //       create: [
  //         {
  //           nome: "Abacaxi",
  //           quantidade: 1,
  //           unidade: "un",
  //           categoria: "HORTIFRUTI",
  //         },
  //       ],
  //     },
  //   })

  //   await dishRepository.create({
  //     nome: "Mousse de maracujá",
  //     categoria: "SOBREMESA",
  //     ingredientes: {
  //       create: [
  //         {
  //           nome: "Leite condensado",
  //           quantidade: 1,
  //           unidade: "un",
  //           categoria: "LATICINIO",
  //         },
  //       ],
  //     },
  //   })

  //   const { pratos } = await sut.execute()

  //   expect(pratos[0].nome).toBe("Abacaxi grelhado")
  //   expect(pratos[1].nome).toBe("Mousse de maracujá")
  //   expect(pratos[2].nome).toBe("Zebra cake")
  // })

  // it("should filter pratos by search term (case-insensitive)", async () => {
  //   await dishRepository.create({
  //     nome: "Tapioca de queijo",
  //     categoria: "CAFE_MANHA",
  //     ingredientes: {
  //       create: [
  //         {
  //           nome: "Goma",
  //           quantidade: 100,
  //           unidade: "g",
  //           categoria: "GRAOS",
  //         },
  //       ],
  //     },
  //   })

  //   await dishRepository.create({
  //     nome: "Tapioca doce",
  //     categoria: "SOBREMESA",
  //     ingredientes: {
  //       create: [
  //         {
  //           nome: "Goma",
  //           quantidade: 100,
  //           unidade: "g",
  //           categoria: "GRAOS",
  //         },
  //       ],
  //     },
  //   })

  //   await dishRepository.create({
  //     nome: "Ovo mexido",
  //     categoria: "CAFE_MANHA",
  //     ingredientes: {
  //       create: [
  //         {
  //           nome: "Ovo",
  //           quantidade: 2,
  //           unidade: "un",
  //           categoria: "PROTEINA",
  //         },
  //       ],
  //     },
  //   })

  //   // Buscar por "tapioca"
  //   const { pratos } = await sut.execute({ search: "tapioca" })

  //   expect(pratos).toHaveLength(2)
  //   expect(pratos).toEqual([
  //     expect.objectContaining({ nome: "Tapioca de queijo" }),
  //     expect.objectContaining({ nome: "Tapioca doce" }),
  //   ])
  // })

  //   it("should filter pratos by search term with different cases", async () => {
  //     await dishRepository.create({
  //       nome: "Tapioca de queijo",
  //       categoria: "CAFE_MANHA",
  //       ingredientes: {
  //         create: [
  //           {
  //             nome: "Goma",
  //             quantidade: 100,
  //             unidade: "g",
  //             categoria: "GRAOS",
  //           },
  //         ],
  //       },
  //     })

  //     const result1 = await sut.execute({ search: "TAPIOCA" })
  //     expect(result1.pratos).toHaveLength(1)

  //     const result2 = await sut.execute({ search: "tapioca" })
  //     expect(result2.pratos).toHaveLength(1)

  //     const result3 = await sut.execute({ search: "TaPiOcA" })
  //     expect(result3.pratos).toHaveLength(1)
  //   })

  //   it("should filter pratos by categoria", async () => {
  //     await dishRepository.create({
  //       nome: "Tapioca de queijo",
  //       categoria: "CAFE_MANHA",
  //       ingredientes: {
  //         create: [
  //           {
  //             nome: "Goma",
  //             quantidade: 100,
  //             unidade: "g",
  //             categoria: "GRAOS",
  //           },
  //         ],
  //       },
  //     })

  //     await dishRepository.create({
  //       nome: "Ovo mexido",
  //       categoria: "CAFE_MANHA",
  //       ingredientes: {
  //         create: [
  //           {
  //             nome: "Ovo",
  //             quantidade: 2,
  //             unidade: "un",
  //             categoria: "PROTEINA",
  //           },
  //         ],
  //       },
  //     })

  //     await dishRepository.create({
  //       nome: "Arroz branco",
  //       categoria: "ALMOCO",
  //       ingredientes: {
  //         create: [
  //           {
  //             nome: "Arroz",
  //             quantidade: 200,
  //             unidade: "g",
  //             categoria: "GRAOS",
  //           },
  //         ],
  //       },
  //     })

  //     await dishRepository.create({
  //       nome: "Pudim",
  //       categoria: "SOBREMESA",
  //       ingredientes: {
  //         create: [
  //           {
  //             nome: "Leite condensado",
  //             quantidade: 1,
  //             unidade: "un",
  //             categoria: "LATICINIO",
  //           },
  //         ],
  //       },
  //     })

  //     const { pratos } = await sut.execute({ categoria: "CAFE_MANHA" })

  //     expect(pratos).toHaveLength(2)
  //     expect(pratos).toEqual([
  //       expect.objectContaining({ categoria: "CAFE_MANHA" }),
  //       expect.objectContaining({ categoria: "CAFE_MANHA" }),
  //     ])
  //   })

  //   it("should combine search and categoria filters", async () => {
  //     await dishRepository.create({
  //       nome: "Tapioca de queijo",
  //       categoria: "CAFE_MANHA",
  //       ingredientes: {
  //         create: [
  //           {
  //             nome: "Goma",
  //             quantidade: 100,
  //             unidade: "g",
  //             categoria: "GRAOS",
  //           },
  //         ],
  //       },
  //     })

  //     await dishRepository.create({
  //       nome: "Tapioca doce",
  //       categoria: "SOBREMESA",
  //       ingredientes: {
  //         create: [
  //           {
  //             nome: "Goma",
  //             quantidade: 100,
  //             unidade: "g",
  //             categoria: "GRAOS",
  //           },
  //         ],
  //       },
  //     })

  //     await dishRepository.create({
  //       nome: "Ovo mexido",
  //       categoria: "CAFE_MANHA",
  //       ingredientes: {
  //         create: [
  //           {
  //             nome: "Ovo",
  //             quantidade: 2,
  //             unidade: "un",
  //             categoria: "PROTEINA",
  //           },
  //         ],
  //       },
  //     })

  //     const { pratos } = await sut.execute({
  //       search: "tapioca",
  //       categoria: "CAFE_MANHA",
  //     })

  //     expect(pratos).toHaveLength(1)
  //     expect(pratos[0].nome).toBe("Tapioca de queijo")
  //   })

  //   it("should return empty array when no pratos match filters", async () => {
  //     await dishRepository.create({
  //       nome: "Tapioca de queijo",
  //       categoria: "CAFE_MANHA",
  //       ingredientes: {
  //         create: [
  //           {
  //             nome: "Goma",
  //             quantidade: 100,
  //             unidade: "g",
  //             categoria: "GRAOS",
  //           },
  //         ],
  //       },
  //     })

  //     const { pratos } = await sut.execute({ search: "pizza" })

  //     expect(pratos).toEqual([])
  //     expect(pratos).toHaveLength(0)
  //   })
})