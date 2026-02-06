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
      title: "Menu Erro",
      checkIn: "2026-02-01",
      checkOut: "2026-02-05",
      adults: 2,
    })

    const res = await request(app.server)
      .post(`/cardapio/${menu.body.menu.id}/suggests`)
      .send({ type: TipoRefeicao.ALMOCO, date: "2026-02-02" })

    expect([400, 503, 500]).toContain(res.status)
  })

  it("should send correct context to IA", async () => {
    vi.mocked(groq.chat.completions.create).mockResolvedValue({
      choices: [{
        message: {
          content: JSON.stringify({
            sugestoes: [
              {
                nome: "Prato 1",
                categoria: "ALMOCO",
                ingredientes: [{ nome: "Ing 1", quantidade: 1, unidade: "un", categoria: "PROTEINA" }]
              },
              {
                nome: "Prato 2",
                categoria: "ALMOCO",
                ingredientes: [{ nome: "Ing 2", quantidade: 1, unidade: "un", categoria: "GRAOS" }]
              },
              {
                nome: "Prato 3",
                categoria: "ALMOCO",
                ingredientes: [{ nome: "Ing 3", quantidade: 1, unidade: "un", categoria: "HORTIFRUTI" }]
              },
            ],
            observacoes: "Mock"
          })
        }
      }]
    } as any)

    const menu = await request(app.server).post("/cardapio").send({
      title: "Dieta",
      checkIn: "2026-02-01",
      checkOut: "2026-02-05",
      adults: 3,
      kids: 2,
      restricoes: []
    })

    const res = await request(app.server)
      .post(`/cardapio/${menu.body.menu.id}/suggests`)
      .send({ type: TipoRefeicao.ALMOCO, date: "2026-02-02" })

    expect(res.status).toBe(200)
    expect(res.body.context.people.total).toBe(5)
  })

  it("should handle minimal IA response (respecting schema limits)", async () => {
    vi.mocked(groq.chat.completions.create).mockResolvedValue({
      choices: [{
        message: {
          content: JSON.stringify({
            sugestoes: [
              { nome: "S1", categoria: "ALMOCO", ingredientes: [{ nome: "I1", quantidade: 1, unidade: "un", categoria: "OUTROS" }] },
              { nome: "S2", categoria: "ALMOCO", ingredientes: [{ nome: "I1", quantidade: 1, unidade: "un", categoria: "OUTROS" }] },
              { nome: "S3", categoria: "ALMOCO", ingredientes: [{ nome: "I1", quantidade: 1, unidade: "un", categoria: "OUTROS" }] }
            ],
            observacoes: "Ok"
          })
        }
      }]
    } as any)

    const menu = await request(app.server).post("/cardapio").send({
      title: "Schema",
      checkIn: "2026-02-01",
      checkOut: "2026-02-05",
      adults: 2,
      restricoes: []
    })

    const res = await request(app.server)
      .post(`/cardapio/${menu.body.menu.id}/suggests`)
      .send({ type: TipoRefeicao.ALMOCO, date: "2026-02-02" })

    expect(res.status).toBe(200)
    expect(res.body.dishes.length).toBeGreaterThanOrEqual(3)
  })
})