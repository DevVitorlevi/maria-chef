import { app } from "@/app"
import { CategoriaIngrediente } from "@/generated/prisma/enums"
import { prisma } from "@/lib/prisma"
import request from "supertest"
import { resetDatabase } from "test/utils/reset-database"
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { createDish } from "../../utils/create-dish"

describe("Create Ingredient (E2E)", () => {
  beforeAll(async () => {
    await app.ready();
  });

  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });


  it("should create an ingredient for an existing dish", async () => {
    const createdDish = await createDish(app)

    const response = await request(app.server)
      .post(`/dish/${createdDish.body.id}/ingredient`)
      .send({
        nome: "Arroz",
        quantidade: 200,
        unidade: "g",
        categoria: CategoriaIngrediente.GRAOS,
      })

    expect(response.statusCode).toBe(201)

    expect(response.body).toEqual(
      expect.objectContaining({
        message: "Added Ingredient",
        ingredient: expect.objectContaining({
          id: expect.any(String),
          nome: "Arroz",
          quantidade: "200",
          unidade: "g",
          categoria: CategoriaIngrediente.GRAOS,
          pratoId: createdDish.body.id,
        }),
      })
    )
  })

  it("should return 400 if dish does not exist", async () => {
    const nonExistingDishId = crypto.randomUUID()

    const response = await request(app.server)
      .post(`/dish/${nonExistingDishId}/ingredient`)
      .send({
        nome: "Feijão",
        quantidade: 100,
        unidade: "g",
        categoria: CategoriaIngrediente.PROTEINA,
      })

    expect(response.statusCode).toBe(400)

    expect(response.body).toEqual({
      message: expect.any(String),
    })
  })
})
