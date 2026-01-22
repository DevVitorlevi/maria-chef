import request from "supertest";
import { setupE2E } from "test/utils/setup-e2e";
import { describe, expect, it } from "vitest";

describe("Create Menu (e2e)", () => {
  let app: Awaited<ReturnType<typeof setupE2E>>

  beforeEach(async () => {
    app = await setupE2E()
  })

  it("should be able to create a menu", async () => {
    const response = await request(app.server)
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

    expect(response.statusCode).toBe(201)
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

  it("should be able to create a menu without optional fields", async () => {
    const response = await request(app.server)
      .post("/cardapio")
      .send({
        title: "Cardápio Simples",
        checkIn: "2026-03-01",
        checkOut: "2026-03-03",
        adults: 1
      })

    expect(response.statusCode).toBe(201)
    expect(response.body).toEqual({
      menu: expect.objectContaining({
        id: expect.any(String),
        titulo: "Cardápio Simples",
        adultos: 1,
        criancas: 0,
        restricoes: [],
        preferencias: null
      })
    })
  })

  it("should not be able to create a menu without adults", async () => {
    const response = await request(app.server)
      .post("/cardapio")
      .send({
        title: "Cardápio Teste",
        checkIn: "2026-02-01",
        checkOut: "2026-02-05",
        adults: 0
      })

    expect(response.statusCode).toBe(400)
  })

  it("should not be able to create a menu with checkout before checkin", async () => {
    const response = await request(app.server)
      .post("/cardapio")
      .send({
        title: "Cardápio Inválido",
        checkIn: "2026-02-05",
        checkOut: "2026-02-01",
        adults: 2
      })

    expect(response.statusCode).toBe(400)
    expect(response.body).toEqual({
      message: expect.any(String)
    })
  })

  it("should not be able to create a menu with missing required fields", async () => {
    const response = await request(app.server)
      .post("/cardapio")
      .send({
        title: "Cardápio Incompleto"
      })

    expect(response.statusCode).toBe(400)
  })
})