import { TipoRefeicao } from "@/generated/prisma/enums"
import { groq } from "@/lib/groq"
import request from "supertest"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { setupE2E } from "../../utils/setup-e2e"

vi.mock("@/lib/groq", () => ({
  groq: { chat: { completions: { create: vi.fn() } } },
  GROQ_CONFIG: { model: "test-model", temperature: 0, max_tokens: 1000 }
}))

describe("Menu AI Suggest Variations (E2E)", () => {
  let app: Awaited<ReturnType<typeof setupE2E>>

  beforeEach(async () => {
    vi.mocked(groq.chat.completions.create).mockReset()
    app = await setupE2E()
  })

  it("should be able to get dish variations", async () => {
    const menuRes = await request(app.server).post("/cardapio").send({
      title: "Menu Maria",
      checkIn: "2026-03-01",
      checkOut: "2026-03-05",
      adults: 2,
      restricoes: ["sem_lactose"]
    })
    const menuId = menuRes.body.menu.id

    const aiMockResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              sugestoes: [
                {
                  nome: "Peixe Grelhado ao Limão",
                  categoria: "ALMOCO",
                  ingredientes: [
                    { nome: "Filé de Peixe", quantidade: 300, unidade: "g", categoria: "PROTEINA" },
                    { nome: "Limão", quantidade: 1, unidade: "un", categoria: "HORTIFRUTI" }
                  ],
                },
                {
                  nome: "Moqueca Vegana de Banana",
                  categoria: "ALMOCO",
                  ingredientes: [
                    { nome: "Banana da Terra", quantidade: 2, unidade: "un", categoria: "HORTIFRUTI" },
                    { nome: "Leite de Coco", quantidade: 200, unidade: "ml", categoria: "OUTROS" }
                  ],
                }
              ],
              observacoes: "Variações leves respeitando a restrição sem lactose."
            }),
          },
        },
      ],
    }

    vi.mocked(groq.chat.completions.create).mockResolvedValue(aiMockResponse as any)

    const response = await request(app.server)
      .post(`/cardapio/${menuId}/variations`)
      .send({
        pratoOriginal: "Frango com Creme",
        contexto: {
          tipo: TipoRefeicao.ALMOCO
        }
      })

    expect(response.status).toBe(200)
    expect(response.body.dishes[0]).toHaveProperty("ingredientes")
    expect(response.body.categoria).toContain("Frango com Creme")
  })

  it("should return 400 if validation fails", async () => {
    const response = await request(app.server)
      .post(`/cardapio/invalid-uuid/variations`)
      .send({
        pratoOriginal: "",
        contexto: { tipo: "INVALIDO" }
      })

    expect(response.status).toBeGreaterThanOrEqual(400)
  })

  it("should return 404 if menu does not exist", async () => {
    const randomId = "00000000-0000-0000-0000-000000000000"

    const response = await request(app.server)
      .post(`/cardapio/${randomId}/variations`)
      .send({
        pratoOriginal: "Arroz",
        contexto: { tipo: TipoRefeicao.ALMOCO }
      })

    expect(response.status).toBe(404)
  })
})