import { CategoriaIngrediente, CategoriaPrato, TipoRefeicao } from "@/generated/prisma/enums"
import request from "supertest"
import { beforeEach, describe, expect, it } from "vitest"
import { setupE2E } from "../../utils/setup-e2e"

describe("Duplicate Menu (E2E)", () => {
  let app: Awaited<ReturnType<typeof setupE2E>>

  beforeEach(async () => {
    app = await setupE2E()
  })

  async function createDishWithIngredient() {
    const dish = await request(app.server)
      .post("/dish")
      .send({
        nome: "Prato Teste",
        categoria: CategoriaPrato.ALMOCO,
      })

    await request(app.server)
      .post(`/dish/${dish.body.id}/ingredient`)
      .send({
        nome: "Ingrediente Teste",
        quantidade: 1,
        unidade: "kg",
        categoria: CategoriaIngrediente.OUTROS,
      })

    return dish.body.id
  }

  async function createMenu(title = "Menu Teste") {
    const response = await request(app.server)
      .post("/cardapio")
      .send({
        title,
        checkIn: "2026-01-01",
        checkOut: "2026-01-05",
        adults: 2,
        kids: 1,
      })

    return response.body.menu.id
  }

  it("should duplicate a menu with success", async () => {
    const dishId = await createDishWithIngredient()
    const menuId = await createMenu("Família Silva")

    await request(app.server)
      .post(`/cardapio/${menuId}/refeicao`)
      .send({
        date: "2026-01-02",
        type: TipoRefeicao.ALMOCO,
        dishes: [dishId],
      })

    const response = await request(app.server)
      .post(`/cardapio/${menuId}/duplicar`)
      .send()

    expect(response.status).toBe(200)
    expect(response.body.cardapio.id).not.toBe(menuId)
    expect(response.body.cardapio.titulo).toBe("Família Silva (cópia)")
  })

  it("should duplicate menu without meals", async () => {
    const menuId = await createMenu("Menu Vazio")

    const response = await request(app.server)
      .post(`/cardapio/${menuId}/duplicar`)
      .send()

    expect(response.body.cardapio.refeicoes).toHaveLength(0)
  })

  it("should keep original menu unchanged after duplication", async () => {
    const dishId = await createDishWithIngredient()
    const menuId = await createMenu("Menu Original")

    await request(app.server)
      .post(`/cardapio/${menuId}/refeicao`)
      .send({
        date: "2026-01-01",
        type: TipoRefeicao.ALMOCO,
        dishes: [dishId],
      })

    const before = await request(app.server).get(`/cardapio/${menuId}`)

    await request(app.server)
      .post(`/cardapio/${menuId}/duplicar`)
      .send()

    const after = await request(app.server).get(`/cardapio/${menuId}`)

    expect(after.body).toEqual(before.body)
  })

  it("should return error when menu does not exist", async () => {
    const response = await request(app.server)
      .post("/cardapio/non-existent-id/duplicar")
      .send()

    expect(response.status).toBe(404)
  })
})
