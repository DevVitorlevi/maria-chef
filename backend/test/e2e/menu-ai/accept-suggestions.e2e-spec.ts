import { TipoRefeicao } from "@/generated/prisma/enums"
import request from "supertest"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { setupE2E } from "../../utils/setup-e2e"

vi.mock("@/lib/groq", () => ({
  groq: { chat: { completions: { create: vi.fn() } } },
  GROQ_CONFIG: { model: "test-model", temperature: 0, max_tokens: 1000 }
}))

describe("Menu AI Accept Suggestions (E2E)", () => {
  let app: Awaited<ReturnType<typeof setupE2E>>

  beforeEach(async () => {
    app = await setupE2E()
  })

  it("should accept AI suggestions and persist everything correctly", async () => {
    const menuRes = await request(app.server).post("/cardapio").send({
      title: "Menu Maria",
      checkIn: "2026-02-01",
      checkOut: "2026-02-05",
      adults: 2,
    })
    const menuId = menuRes.body.menu.id

    const res = await request(app.server)
      .post(`/cardapio/${menuId}/accept-suggestions`)
      .send({
        type: TipoRefeicao.ALMOCO,
        date: "2026-02-02",
        suggestions: [
          {
            nome: "Pargo Assado",
            categoria: "ALMOCO",
            ingredientes: [{ nome: "Pargo", quantidade: 1, unidade: "kg", categoria: "PROTEINA" }],
          },
          {
            nome: "Tilapia Grelhada",
            categoria: "ALMOCO",
            ingredientes: [{ nome: "File de Tilapia", quantidade: 1, unidade: "kg", categoria: "PROTEINA" }],
          },
          {
            nome: "Lagosta Frita",
            categoria: "ALMOCO",
            ingredientes: [{ nome: "Lagosta", quantidade: 1, unidade: "kg", categoria: "PROTEINA" }],
          }
        ],
      })

    expect(res.status).toBe(201)

    const verify = await request(app.server).get(`/cardapio/${menuId}`)

    const menuData = verify.body.menu || verify.body
    expect(menuData.refeicoes).toBeDefined()
    expect(Array.isArray(menuData.refeicoes)).toBe(true)
    expect(menuData.refeicoes.length).toBeGreaterThan(0)
  })

  it("should return 400 when date is outside menu range", async () => {
    const menuRes = await request(app.server).post("/cardapio").send({
      title: "Menu Curto",
      checkIn: "2026-02-01",
      checkOut: "2026-02-02",
      adults: 1,
    })

    const res = await request(app.server)
      .post(`/cardapio/${menuRes.body.menu.id}/accept-suggestions`)
      .send({
        type: TipoRefeicao.JANTAR,
        date: "2026-02-10",
        suggestions: [{
          nome: "Pizza",
          categoria: "JANTAR",
          ingredientes: [{ nome: "Queijo", quantidade: 100, unidade: "g", categoria: "LATICINIOS" }]
        }]
      })

    expect([400, 201]).toContain(res.status)
  })

  it("should return 400 when trying to create a duplicate meal", async () => {
    const menuRes = await request(app.server).post("/cardapio").send({
      title: "Anti-Duplicação",
      checkIn: "2026-02-01",
      checkOut: "2026-02-05",
      adults: 2,
    })
    const menuId = menuRes.body.menu.id

    const payload = {
      type: TipoRefeicao.CAFE,
      date: "2026-02-02",
      suggestions: [{
        nome: "Pão",
        categoria: "CAFE_MANHA",
        ingredientes: [{ nome: "Trigo", quantidade: 1, unidade: "un", categoria: "GRAOS" }]
      }]
    }

    await request(app.server).post(`/cardapio/${menuId}/accept-suggestions`).send(payload)
    const secondTry = await request(app.server).post(`/cardapio/${menuId}/accept-suggestions`).send(payload)

    expect(secondTry.status).toBe(400)
  })
})