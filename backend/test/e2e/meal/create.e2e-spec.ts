import { CategoriaIngrediente, CategoriaPrato, TipoRefeicao } from "@/generated/prisma/enums"
import request from "supertest"
import { beforeEach, describe, expect, it } from "vitest"
import { setupE2E } from "../../utils/setup-e2e"

describe("Create Meal (E2E)", () => {
  let app: Awaited<ReturnType<typeof setupE2E>>

  beforeEach(async () => {
    app = await setupE2E()
  })

  it("should be able to create a meal in an existing menu", async () => {
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

    const response = await request(app.server)
      .post(`/cardapio/${menuId}/refeicao`)
      .send({
        date: "2026-02-03",
        type: TipoRefeicao.ALMOCO,
        dishes: [dishId],
      })

    expect(response.statusCode).toBe(201)
    expect(response.body.message).toBe("Meal created successfully")
    expect(response.body.meal).toHaveProperty("id")
    expect(response.body.meal.pratos).toHaveLength(1)
    expect(response.body.meal.pratos[0].id).toBe(dishId)
  })

  it("should not be able to create a meal without dishes", async () => {
    const createMenu = await request(app.server)
      .post("/cardapio")
      .send({
        title: "Cardápio Teste",
        checkIn: "2026-02-01",
        checkOut: "2026-02-05",
        adults: 2,
      })

    const menuId = createMenu.body.menu.id

    const response = await request(app.server)
      .post(`/cardapio/${menuId}/refeicao`)
      .send({
        date: "2026-02-03",
        type: TipoRefeicao.ALMOCO,
        dishes: [],
      })

    expect(response.statusCode).toBe(400)
  })

  it("should not be able to create a meal in non-existing menu", async () => {
    const response = await request(app.server)
      .post("/cardapio/550e8400-e29b-41d4-a716-446655440099/refeicao")
      .send({
        date: "2026-02-03",
        type: TipoRefeicao.ALMOCO,
        dishes: ["550e8400-e29b-41d4-a716-446655440001"],
      })

    expect(response.statusCode).toBe(404)
  })
})
