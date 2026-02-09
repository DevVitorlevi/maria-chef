import { CategoriaIngrediente, CategoriaPrato, TipoRefeicao } from "@/generated/prisma/enums"
import { groq } from "@/lib/groq"
import request from "supertest"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { setupE2E } from "../../utils/setup-e2e"

vi.mock("@/lib/groq", () => ({
  groq: { chat: { completions: { create: vi.fn() } } },
  GROQ_CONFIG: { model: "test-model", temperature: 0, max_tokens: 1000 }
}))

describe("Accept Variation (E2E)", () => {
  let app: Awaited<ReturnType<typeof setupE2E>>

  beforeEach(async () => {
    vi.mocked(groq.chat.completions.create).mockReset()
    app = await setupE2E()
  })

  it("should perform the full journey: setup menu, get AI variation, and accept it", async () => {
    const menuRes = await request(app.server).post("/cardapio").send({
      title: "Viagem E2E Completa",
      checkIn: "2026-02-01",
      checkOut: "2026-02-05",
      adults: 2,
    })
    const menuId = menuRes.body.menu.id

    const mealSetup = await request(app.server)
      .post(`/cardapio/${menuId}/accept-suggestions`)
      .send({
        type: TipoRefeicao.ALMOCO,
        date: "2026-02-02",
        suggestions: [
          {
            nome: "Frango Grelhado Simples",
            categoria: CategoriaPrato.ALMOCO,
            ingredientes: [
              { nome: "Peito de Frango", quantidade: 500, unidade: "g", categoria: CategoriaIngrediente.PROTEINA }
            ],
          }
        ],
      })

    const meal = mealSetup.body.meal
    const mealId = meal.id
    const oldPlateId = meal.pratos[0].id


    const aiMockResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              sugestoes: [
                {
                  nome: "Frango ao Curry Especial",
                  categoria: CategoriaPrato.ALMOCO,
                  ingredientes: [
                    { nome: "Sobrecoxa", quantidade: 500, unidade: "g", categoria: CategoriaIngrediente.PROTEINA },
                    { nome: "Curry", quantidade: 10, unidade: "g", categoria: CategoriaIngrediente.TEMPERO }
                  ],
                }
              ],
              observacoes: "Uma variação mais saborosa."
            }),
          },
        },
      ],
    }

    vi.mocked(groq.chat.completions.create).mockResolvedValue(aiMockResponse as any)

    const variationRes = await request(app.server)
      .post(`/cardapio/${menuId}/variations`)
      .send({
        pratoOriginal: meal.pratos[0].nome,
        contexto: { tipo: meal.tipo }
      })

    expect(variationRes.status).toBe(200)

    const sugestaoEscolhida = variationRes.body.dishes[0]

    const acceptRes = await request(app.server)
      .patch(`/cardapio/${menuId}/meals/${mealId}/variations/${oldPlateId}/accept`)
      .send({
        menuId,
        sugestaoEscolhida
      })

    expect(acceptRes.status).toBe(201)
    expect(acceptRes.body.dish.nome).toBe("Frango ao Curry Especial")

    const verify = await request(app.server).get(`/cardapio/${menuId}/refeicao/${mealId}`)
    const mealData = verify.body

    const nomesPratos = mealData.pratos.map((p: any) => p.nome)

    expect(nomesPratos).toContain("Frango ao Curry Especial")
    expect(nomesPratos).not.toContain("Frango Grelhado Simples")

    const novoPrato = mealData.pratos.find((p: any) => p.nome === "Frango ao Curry Especial")
    expect(novoPrato.ingredientes).toHaveLength(2)
  })

  it("should return 404 if trying to accept variation for non-existent meal", async () => {
    const randomId = "00000000-0000-0000-0000-000000000000"

    const res = await request(app.server)
      .patch(`/cardapio/${randomId}/meals/${randomId}/variations/${randomId}/accept`)
      .send({
        menuId: randomId,
        sugestaoEscolhida: {
          nome: "Prato Teste",
          categoria: CategoriaPrato.ALMOCO,
          ingredientes: []
        }
      })

    expect(res.status).toBe(404)
  })
})