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

  it("should perform the full journey from creation to variation acceptance", async () => {
    const menuRes = await request(app.server).post("/cardapio").send({
      title: "Viagem E2E",
      checkIn: "2026-02-01",
      checkOut: "2026-02-05",
      adults: 2,
    })
    const menuId = menuRes.body.menu.id

    const mealRes = await request(app.server)
      .post(`/cardapio/${menuId}/accept-suggestions`)
      .send({
        type: TipoRefeicao.ALMOCO,
        date: "2026-02-02",
        suggestions: [{
          nome: "Frango Grelhado",
          categoria: "ALMOCO",
          ingredientes: [{ nome: "Peito de Frango", quantidade: 1, unidade: "un", categoria: "PROTEINA" }]
        }]
      })

    const mealId = mealRes.body.data.meal.id
    const oldPlateId = mealRes.body.data.meal.pratos[0].id

    const acceptRes = await request(app.server)
      .patch(`/cardapio/${menuId}/meals/${mealId}/variations/${oldPlateId}/accept`)
      .send({
        menuId,
        sugestaoEscolhida: {
          nome: "Frango ao Curry Especial",
          categoria: CategoriaPrato.ALMOCO,
          ingredientes: [
            { nome: "Curry", quantidade: 10, unidade: "g", categoria: CategoriaIngrediente.TEMPERO }
          ]
        }
      })

    expect(acceptRes.status).toBe(201)
    expect(acceptRes.body.data.dish.nome).toBe("Frango ao Curry Especial")

    const verify = await request(app.server).get(`/cardapio/${menuId}`)
    const menuData = verify.body.menu || verify.body
    const mealInDb = menuData.refeicoes.find((m: any) => m.id === mealId)

    expect(mealInDb.pratos.map((p: any) => p.nome)).toContain("Frango ao Curry Especial")
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

    expect(res.status).toBe(400)
  })
})
