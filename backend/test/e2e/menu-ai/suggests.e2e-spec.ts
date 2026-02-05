import { vi } from "vitest"

vi.mock("@/lib/groq", () => ({
  groq: {
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  },
  GROQ_CONFIG: {
    model: "test-model",
    temperature: 0,
    max_tokens: 100,
  },
}))

import {
  CategoriaPrato,
  TipoRefeicao
} from "@/generated/prisma/enums"

import request from "supertest"
import { beforeEach, describe, expect, it } from "vitest"
import { setupE2E } from "../../utils/setup-e2e"

describe("Menu AI Suggests (E2E)", () => {
  let app: Awaited<ReturnType<typeof setupE2E>>

  beforeEach(async () => {
    const { groq } = await import("@/lib/groq")
    vi.mocked(groq.chat.completions.create).mockReset()
    app = await setupE2E()
  })

  it("should suggest dishes for lunch based on menu context", async () => {
    const { groq } = await import("@/lib/groq")

    vi.mocked(groq.chat.completions.create).mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              sugestoes: [
                "Moqueca de Tilápia",
                "Arroz de coco",
                "Salada tropical"
              ],
              observacoes: "Pratos leves",
            }),
          },
        },
      ],
    } as any)

    const dish = await request(app.server).post("/dish").send({
      nome: "Pizza",
      categoria: CategoriaPrato.ALMOCO,
    })

    const menu = await request(app.server).post("/cardapio").send({
      title: "Menu Teste",
      checkIn: "2026-02-01",
      checkOut: "2026-02-05",
      adults: 2,
      kids: 2,
      restricoes: [],
    })

    const menuId = menu.body.menu.id

    await request(app.server).post(`/cardapio/${menuId}/refeicao`).send({
      date: "2026-02-02",
      type: TipoRefeicao.ALMOCO,
      dishes: [dish.body.id],
    })

    const res = await request(app.server)
      .post(`/cardapio/${menuId}/suggests`)
      .send({
        type: TipoRefeicao.ALMOCO,
        date: "2026-02-03",
      })

    expect(res.status).toBe(200)
    expect(res.body.suggestions).toBeTruthy()
    expect(res.body.context.people.total).toBe(4)
  })
})
