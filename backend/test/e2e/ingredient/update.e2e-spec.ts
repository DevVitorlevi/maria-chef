import { app } from "@/app"
import { CategoriaIngrediente } from "@/generated/prisma/enums"
import { prisma } from "@/lib/prisma"
import request from "supertest"
import { resetDatabase } from "test/utils/reset-database"
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { createDish } from "../../utils/create-dish"

describe("Update Ingredient (E2E)", () => {
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


  it("should be able update an ingredient for an existing dish", async () => {
    const createdDish = await createDish(app)

    const response = await request(app.server)
      .put(`/dish/${createdDish.body.id}/ingredient/${createdDish.body.ingredientes[1].id}`)
      .send({
        nome: "Queijo",
        quantidade: 200,
        unidade: "g",
        categoria: CategoriaIngrediente.LATICINIO,
      })

    expect(response.statusCode).toBe(204)
  })

  it("should not be able update an dish does not exist", async () => {
    const nonExistingDishId = crypto.randomUUID()

    const response = await request(app.server)
      .put(`/dish/${nonExistingDishId}/ingredient/${nonExistingDishId}`)
      .send({
        nome: "Queijo",
        quantidade: 200,
        unidade: "g",
        categoria: CategoriaIngrediente.LATICINIO,
      })


    expect(response.statusCode).toBe(400)

    expect(response.body).toEqual({
      message: expect.any(String),
    })
  })
})
