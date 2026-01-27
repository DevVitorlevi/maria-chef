import request from "supertest";
import { setupE2E } from "test/utils/setup-e2e";
import { describe, expect, it } from "vitest";

describe("Update Menu (e2e)", () => {
  let app: Awaited<ReturnType<typeof setupE2E>>

  beforeEach(async () => {
    app = await setupE2E()
  })

  it("should be able to update a menu", async () => {
    const menu = await request(app.server)
      .post("/cardapio")
      .send({
        title: "Cardápio Família Silva",
        checkIn: "2026-02-01",
        checkOut: "2026-02-05",
        adults: 2,
        kids: 2,
        restricoes: ["vegetariano", "sem glúten"],
        preferencias: "Prefere comidas leves e saudáveis"
      })

    const menuId = menu.body.menu.id

    const response = await request(app.server)
      .put(`/cardapio/${menuId}`)
      .send({
        title: "Cardápio Família Augusto",
        checkIn: "2026-02-09",
        checkOut: "2026-02-10",
        adults: 2,
        kids: 2,
        restricoes: ["vegetariano", "sem glúten"],
        preferencias: "Prefere comidas leves e saudáveis"
      })

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      menu: expect.objectContaining({
        id: expect.any(String),
        titulo: "Cardápio Família Augusto",
        adultos: 2,
        criancas: 2,
        restricoes: ["vegetariano", "sem glúten"],
        preferencias: "Prefere comidas leves e saudáveis",
        geradoPorIA: false
      })
    })
  })

  it("should not be able to update a menu non-existent", async () => {
    const response = await request(app.server)
      .put(`/cardapio/non-existent-id`)
      .send({
        title: "Cardápio Família Augusto",
        checkIn: "2026-02-09",
        checkOut: "2026-02-10",
        adults: 2,
        kids: 2,
        restricoes: ["vegetariano", "sem glúten"],
        preferencias: "Prefere comidas leves e saudáveis"
      })

    expect(response.statusCode).toBe(404)
  })
})