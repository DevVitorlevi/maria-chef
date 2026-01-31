import { CategoriaIngrediente, CategoriaPrato, TipoRefeicao } from "@/generated/prisma/enums"
import request from "supertest"
import { beforeEach, describe, expect, it } from "vitest"
import { setupE2E } from "../../utils/setup-e2e"

describe("Delete Menu (E2E)", () => {
  let app: Awaited<ReturnType<typeof setupE2E>>

  beforeEach(async () => {
    app = await setupE2E()
  })

  it("should be able to delete a menu", async () => {
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

    await request(app.server)
      .post(`/cardapio/${menuId}/refeicao`)
      .send({
        date: "2026-02-03",
        type: TipoRefeicao.ALMOCO,
        dishes: [dishId],
      })

    const response = await request(app.server)
      .delete(`/cardapio/${menuId}`)
      .send()

    expect(response.status).toBe(204)
  })
})