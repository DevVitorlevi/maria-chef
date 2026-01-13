import { app } from "@/app"
import { prisma } from "@/lib/prisma"
import { CategoriaIngrediente, CategoriaPrato } from "@/generated/prisma/client"
import request from "supertest"
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { createDish } from "../../utils/create-dish"

describe("Find By Id Dish (E2E)", () => {
  beforeAll(async () => {
    await app.ready()

    await prisma.ingrediente.deleteMany()
    await prisma.prato.deleteMany()
  })

  afterAll(async () => {
    await prisma.ingrediente.deleteMany()
    await prisma.prato.deleteMany()
    await prisma.$disconnect()
    await app.close()
  })

  it("should be able to find a dish with ingredients", async () => {
    const createResponse = await createDish(app)

    if (createResponse.statusCode !== 201) {
      console.error('Failed to create dish:', {
        statusCode: createResponse.statusCode,
        body: createResponse.body
      })
    }

    expect(createResponse.statusCode).toBe(201)

    const dishId = createResponse.body.id

    const response = await request(app.server)
      .get(`/dish/${dishId}`)
      .send()

    expect(response.statusCode).toBe(200)
    expect(response.body.prato).toEqual(
      expect.objectContaining({
        id: dishId,
        nome: "Pizza Margherita",
        categoria: CategoriaPrato.LANCHE,
      })
    )
    expect(response.body.prato.ingredientes).toHaveLength(2)
    expect(response.body.prato.ingredientes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          nome: "Farinha",
          quantidade: "1",
          unidade: "kg",
          categoria: CategoriaIngrediente.OUTROS,
        }),
        expect.objectContaining({
          nome: "Tomate",
          quantidade: "3",
          unidade: "un",
          categoria: CategoriaIngrediente.HORTIFRUTI,
        }),
      ])
    )
  })
})