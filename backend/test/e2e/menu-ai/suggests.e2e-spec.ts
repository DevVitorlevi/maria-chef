import { TipoRefeicao } from "@/generated/prisma/enums"
import { groq } from "@/lib/groq"
import request from "supertest"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { setupE2E } from "../../utils/setup-e2e"

vi.mock("@/lib/groq", () => ({
  groq: { chat: { completions: { create: vi.fn() } } },
  GROQ_CONFIG: { model: "test-model", temperature: 0, max_tokens: 1000 }
}))

describe("Menu AI Suggests (E2E)", () => {
  let app: Awaited<ReturnType<typeof setupE2E>>

  beforeEach(async () => {
    vi.mocked(groq.chat.completions.create).mockReset()
    app = await setupE2E()
  })

  it("should return error status when Groq service fails", async () => {
    vi.mocked(groq.chat.completions.create).mockRejectedValue(new Error("API Down"))

    const menu = await request(app.server).post("/cardapio").send({
      title: "Menu Maria",
      checkIn: "2026-02-01",
      checkOut: "2026-02-05",
      adults: 2,
      kids: 0,
    })

    const res = await request(app.server)
      .post(`/cardapio/${menu.body.menu.id}/suggests`)
      .send({ type: TipoRefeicao.ALMOCO, date: "2026-02-02" })

    expect([400, 503, 500]).toContain(res.status)
  })

  it("should send correct context to IA", async () => {
    const mockResponse = {
      sugestoes: [
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
      notes: ""
    }

    vi.mocked(groq.chat.completions.create).mockResolvedValue({
      choices: [{ message: { content: JSON.stringify(mockResponse) } }]
    } as any)

    const menu = await request(app.server).post("/cardapio").send({
      title: "Dieta",
      checkIn: "2026-02-01",
      checkOut: "2026-02-10",
      adults: 3,
      kids: 2,
      restricoes: []
    })

    const res = await request(app.server)
      .post(`/cardapio/${menu.body.menu.id}/suggests`)
      .send({
        type: TipoRefeicao.ALMOCO,
        date: "2026-02-05"
      })

    expect(res.status).toBe(200)
    expect(res.body.context.people.total).toBe(5)
  })

  it("should handle minimal IA response (respecting schema limits)", async () => {
    vi.mocked(groq.chat.completions.create).mockResolvedValue({
      choices: [{
        message: {
          content: JSON.stringify({
            sugestoes: [
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
            notes: ""
          })
        }
      }]
    } as any)

    const menu = await request(app.server).post("/cardapio").send({
      title: "Menu Maria",
      checkIn: "2026-02-01",
      checkOut: "2026-02-05",
      adults: 2,
      kids: 0,
      restricoes: []
    })

    const res = await request(app.server)
      .post(`/cardapio/${menu.body.menu.id}/suggests`)
      .send({ type: TipoRefeicao.ALMOCO, date: "2026-02-02" })

    expect(res.status).toBe(200)
    expect(res.body.dishes.length).toBeGreaterThanOrEqual(3)
  })
})