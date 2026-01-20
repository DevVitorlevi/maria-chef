import { CategoriaIngrediente, CategoriaPrato } from "@/generated/prisma/client";
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


    await request(app.server)
      .post(`/dish/${dishId}/ingredient`)
      .send({
        nome: "Farinha de Trigo",
        quantidade: 1,
        unidade: "kg",
        categoria: CategoriaIngrediente.OUTROS,
      })



    await request(app.server)
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
    expect(response.body.dish).toEqual(
      expect.objectContaining({
        id: dishId,
        nome: "Pizza Margherita",
        categoria: CategoriaPrato.LANCHE,
      })
    )
    expect(response.body.dish.ingredientes).toHaveLength(2)
    expect(response.body.dish.ingredientes).toEqual(
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