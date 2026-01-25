import { CategoriaIngrediente, CategoriaPrato, TipoRefeicao } from "@/generated/prisma/enums"
import request from "supertest"
import { beforeEach, describe, expect, it } from "vitest"
import { setupE2E } from "../../utils/setup-e2e"

describe("Create Meal (E2E)", () => {
  let app: Awaited<ReturnType<typeof setupE2E>>

  beforeEach(async () => {
    app = await setupE2E()
  })

  it("should be able to delete a meal in an existing menu", async () => {
    const createdDish = await request(app.server)
      .post("/dish")
      .send({
        nome: "Pizza Margherita",
        categoria: CategoriaPrato.ALMOCO,
      })

    const dishId = createdDish.body.id

    await request(app.server)
      .post(`/dish/${dishId}/ingredient`)
      .send({
        nome: "Farinha de Trigo",
        quantidade: 1,
        unidade: "kg",
        categoria: CategoriaIngrediente.OUTROS,
      })

    const createMenu = await request(app.server)
      .post("/cardapio")
      .send({
        title: "Cardápio Família Silva",
        checkIn: "2026-02-01",
        checkOut: "2026-02-05",
        adults: 2,
        kids: 2,
      })

    const menuId = createMenu.body.menu.id

    const meal = await request(app.server)
      .post(`/cardapio/${menuId}/refeicao`)
      .send({
        date: "2026-02-03",
        type: TipoRefeicao.ALMOCO,
        dishes: [dishId],
      })

    const mealId = meal.body.meal.id
    const response = await request(app.server)
      .delete(`/cardapio/${menuId}/refeicao/${mealId}`)
      .send()

    expect(response.statusCode).toBe(204)
  })

  it("should not be able to delete a meal in an menu non-existent", async () => {
    const response = await request(app.server)
      .delete(`/cardapio/non-existent-menu/refeicao/non-existent-meal`)
      .send()

    expect(response.statusCode).toBe(400)
  })

})
