import {
  CategoriaIngrediente,
  CategoriaPrato,
  TipoRefeicao,
} from "@/generated/prisma/enums"
import request from "supertest"
import { beforeEach, describe, expect, it } from "vitest"
import { setupE2E } from "../../utils/setup-e2e"

describe("Menu AI Suggests (E2E)", () => {
  let app: Awaited<ReturnType<typeof setupE2E>>

  beforeEach(async () => {
    app = await setupE2E()
  })

  it("should be able to suggest dishes based on menu context", async () => {
    const createdDish = await request(app.server)
      .post("/dish")
      .send({
        nome: "Pizza Margherita",
        categoria: CategoriaPrato.ALMOCO,
      })

    expect(createdDish.status).toBe(201)

    const dishId = createdDish.body.id

    const createdIngredient = await request(app.server)
      .post(`/dish/${dishId}/ingredient`)
      .send({
        nome: "Farinha de Trigo",
        quantidade: 1,
        unidade: "kg",
        categoria: CategoriaIngrediente.OUTROS,
      })

    expect(createdIngredient.status).toBe(201)

    const createMenu = await request(app.server)
      .post("/cardapio")
      .send({
        title: "Cardápio Família Silva",
        checkIn: "2026-02-01",
        checkOut: "2026-02-05",
        adults: 2,
        kids: 2,
      })

    expect(createMenu.status).toBe(201)

    const menuId = createMenu.body.menu.id

    const createMeal = await request(app.server)
      .post(`/cardapio/${menuId}/refeicao`)
      .send({
        date: "2026-02-03",
        type: TipoRefeicao.ALMOCO,
        dishes: [dishId],
      })

    expect(createMeal.status).toBe(201)

    const response = await request(app.server)
      .post(`/cardapio/${menuId}/suggests`)
      .send({
        type: TipoRefeicao.ALMOCO,
        date: "2026-02-03",
        context: {
          title: "Cardápio Família Silva",
          checkin: "2026-02-01",
          checkout: "2026-02-05",
          adults: 2,
          kids: 2,
          restricoes: [],
          preferencias: "comida italiana simples",
        },
      })

    console.log(response.body)

    expect(response.status).toBe(200)

    expect(response.body).toEqual(
      expect.objectContaining({
        suggestions: expect.any(Array),
        context: expect.objectContaining({
          menu: "Cardápio Família Silva",
          type: TipoRefeicao.ALMOCO,
          people: {
            adults: 2,
            kids: 2,
            total: 4,
          },
          restricoes: [],
        }),
        notes: expect.any(String),
      }),
    )

    expect(response.body.suggestions.length).toBeGreaterThan(0)
  })
})
