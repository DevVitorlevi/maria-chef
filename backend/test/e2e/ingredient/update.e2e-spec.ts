import { CategoriaIngrediente } from "@/generated/prisma/enums";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createDish } from "../../utils/create-dish";
import { setupE2E } from '../../utils/setup-e2e';
describe("Update Ingredient (E2E)", () => {
  let app: Awaited<ReturnType<typeof setupE2E>>

  beforeEach(async () => {
    app = await setupE2E()
  })

  it("should be able update an ingredient for an existing dish", async () => {
    const createdDish = await createDish(app)
    const ingredient = await await request(app.server)
      .post(`/dish/${createdDish.body.id}/ingredient`)
      .send({
        nome: "Farinha de Rosca",
        quantidade: 200,
        unidade: "g",
        categoria: CategoriaIngrediente.OUTROS,
      })

    const response = await request(app.server)
      .put(`/dish/${createdDish.body.id}/ingredient/${ingredient.body.ingredient.id}`)
      .send({
        nome: "Farinha de Trigo",
        quantidade: 200,
        unidade: "g",
        categoria: CategoriaIngrediente.OUTROS,
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
