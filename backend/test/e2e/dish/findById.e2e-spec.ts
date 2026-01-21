import { CategoriaIngrediente } from "@/generated/prisma/client";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createDish } from "../../utils/create-dish";
import { setupE2E } from '../../utils/setup-e2e';

describe("Find By Id Dish (E2E)", () => {
  let app: Awaited<ReturnType<typeof setupE2E>>

  beforeEach(async () => {
    app = await setupE2E()
  })


  it("should be able to find a dish with ingredients", async () => {
    const createResponse = await createDish(app)

    const dishId = createResponse.body.id

    const ingredient1 = await request(app.server)
      .post(`/dish/${dishId}/ingredient`)
      .send({
        nome: "Farinha de Trigo",
        quantidade: 1,
        unidade: "kg",
        categoria: CategoriaIngrediente.OUTROS,
      })

    const ingredient2 = await request(app.server)
      .post(`/dish/${dishId}/ingredient`)
      .send({
        nome: "Tomate",
        quantidade: 3,
        unidade: "un",
        categoria: CategoriaIngrediente.HORTIFRUTI,
      })

    const response = await request(app.server)
      .get(`/dish/${dishId}`)
      .send()

    expect(response.statusCode).toBe(200)
    expect(response.body.dish.ingredientes).toHaveLength(2)
    expect(response.body.dish.ingredientes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: ingredient1.body.ingredient.id,
          nome: "Farinha de Trigo",
          quantidade: "1",
          unidade: "kg",
          categoria: CategoriaIngrediente.OUTROS,
          pratoId: dishId
        }),
        expect.objectContaining({
          id: ingredient2.body.ingredient.id,
          nome: "Tomate",
          quantidade: "3",
          unidade: "un",
          categoria: CategoriaIngrediente.HORTIFRUTI,
          pratoId: dishId
        }),
      ])
    )
  })
})