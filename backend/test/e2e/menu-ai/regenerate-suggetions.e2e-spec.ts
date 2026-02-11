import { TipoRefeicao } from "@/generated/prisma/enums"
import { groq } from "@/lib/groq"
import request from "supertest"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { setupE2E } from "../../utils/setup-e2e"

vi.mock("@/lib/groq", () => ({
  groq: { chat: { completions: { create: vi.fn() } } },
  GROQ_CONFIG: { model: "test-model", temperature: 0, max_tokens: 1000 }
}))

describe("Menu AI Regenerate Suggestions (E2E)", () => {
  let app: Awaited<ReturnType<typeof setupE2E>>

  beforeEach(async () => {
    vi.mocked(groq.chat.completions.create).mockReset()
    app = await setupE2E()
  })

  it("should be able to regenerate dish suggestions avoiding previous ones", async () => {
    const menuRes = await request(app.server).post("/cardapio").send({
      title: "Menu Maria",
      checkIn: "2026-02-01",
      checkOut: "2026-02-05",
      adults: 2,
    })
    const menuId = menuRes.body.menu.id

    const aiMockResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              sugestoes: [
                {
                  nome: "Omelete",
                  categoria: "CAFE_MANHA",
                  ingredientes: [{ nome: "Ovo", quantidade: 2, unidade: "un", categoria: "PROTEINA" }],
                }
              ],
              observacoes: "Novas sugestões evitando os pratos anteriores"
            }),
          },
        },
      ],
    }

    vi.mocked(groq.chat.completions.create).mockResolvedValue(aiMockResponse as any)

    const response = await request(app.server)
      .post(`/cardapio/${menuId}/regenarate-suggestions`)
      .send({
        type: TipoRefeicao.CAFE,
        date: "2026-02-02",
        previousSuggestions: []
      })

    expect(response.status).toBe(200)
  })

  it("should return 400 if validation fails", async () => {
    const response = await request(app.server)
      .post(`/cardapio/invalid-uuid/regenerate-suggestions`)
      .send({
        type: "INVALID_TYPE",
        date: "invalid-date"
      })

    expect(response.status).toBe(404)
  })

  it("should return 404 if menu does not exist", async () => {
    const randomId = "00000000-0000-0000-0000-000000000000"

    const response = await request(app.server)
      .post(`/cardapio/${randomId}/regenerate-suggestions`)
      .send({
        type: TipoRefeicao.ALMOCO,
        date: "2026-02-02",
        previousSuggestions: []
      })

    expect(response.status).toBe(404)
  })
})