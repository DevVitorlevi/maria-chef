import request from "supertest";
import { setupE2E } from "test/utils/setup-e2e";
import { describe, expect, it } from "vitest";

describe("Find By Id Menu (E2E)", () => {
  let app: Awaited<ReturnType<typeof setupE2E>>

  beforeEach(async () => {
    app = await setupE2E()
  })

  it("should be able to find a menu by id", async () => {
    const createMenu = await request(app.server)
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

    const menuId = createMenu.body.menu.id

    const response = await request(app.server)
      .get(`/cardapio/${menuId}`)
      .send()

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      menu: expect.objectContaining({
        id: expect.any(String),
        titulo: "Cardápio Família Silva",
        adultos: 2,
        criancas: 2,
        restricoes: ["vegetariano", "sem glúten"],
        preferencias: "Prefere comidas leves e saudáveis",
        geradoPorIA: false
      })
    })
  })

  it("should not be able to find an menu not-existent", async () => {
    const response = await request(app.server)
      .get(`/cardapio/non-existent-menu`)
      .send()

    expect(response.statusCode).toBe(400)
  })
})