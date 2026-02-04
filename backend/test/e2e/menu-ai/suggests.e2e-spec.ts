import {
  CategoriaPrato,
  TipoRefeicao
} from "@/generated/prisma/enums"
import request from "supertest"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { setupE2E } from "../../utils/setup-e2e"

vi.mock("@/lib/gemini", () => {
  return {
    ai: {
      models: {
        generateContent: vi.fn(),
      },
    },
    GEMINI_CONFIG: {
      model: "gemini-3-flash-preview",
      config: {
        maxOutputTokens: 2048,
        temperature: 0.7,
      },
    },
  }
})

describe("Menu AI Suggests (E2E)", () => {
  let app: Awaited<ReturnType<typeof setupE2E>>

  beforeEach(async () => {
    app = await setupE2E()
    const { ai } = await import("@/lib/gemini")
    vi.mocked(ai.models.generateContent).mockReset()
  })

  it("should suggest dishes for lunch based on menu context", async () => {
    const { ai } = await import("@/lib/gemini")

    vi.mocked(ai.models.generateContent).mockResolvedValue({
      text: JSON.stringify({
        sugestoes: [
          "Moqueca de Tilápia",
          "Arroz de coco",
          "Salada tropical",
          "Farofa de coco",
          "Banana frita",
        ],
        observacoes: "Pratos leves inspirados na culinária nordestina",
      }),
    } as any)

    const createdDish = await request(app.server).post("/dish").send({
      nome: "Pizza Margherita",
      categoria: CategoriaPrato.ALMOCO,
    })

    const createMenu = await request(app.server).post("/cardapio").send({
      title: "Cardápio Família Silva",
      checkIn: "2026-02-01",
      checkOut: "2026-02-05",
      adults: 2,
      kids: 2,
      restricoes: [],
      preferencias: "comida italiana simples",
    })

    const menuId = createMenu.body.menu.id

    await request(app.server)
      .post(`/cardapio/${menuId}/refeicao`)
      .send({
        date: "2026-02-02",
        type: TipoRefeicao.ALMOCO,
        dishes: [createdDish.body.id],
      })

    const response = await request(app.server)
      .post(`/cardapio/${menuId}/suggests`)
      .send({
        type: TipoRefeicao.ALMOCO,
        date: "2026-02-03",
      })

    expect(response.status).toBe(200)
    expect(response.body.suggestions).toContain("Moqueca de Tilápia")
    expect(response.body.context.people.total).toBe(4)
  })

  it("should include existing meals context in AI prompt", async () => {
    const { ai } = await import("@/lib/gemini")
    const generateContentSpy = vi.mocked(ai.models.generateContent)

    generateContentSpy.mockResolvedValue({
      text: JSON.stringify({
        sugestoes: ["Salada Caesar"],
        observacoes: "Ok",
      }),
    } as any)

    const dish = await request(app.server).post("/dish").send({
      nome: "Lasanha Especial",
      categoria: CategoriaPrato.JANTAR,
    })

    const menu = await request(app.server).post("/cardapio").send({
      title: "Menu Italiano",
      checkIn: "2026-06-01",
      checkOut: "2026-06-05",
      adults: 4,
    })

    const menuId = menu.body.menu.id

    await request(app.server).post(`/cardapio/${menuId}/refeicao`).send({
      date: "2026-06-01",
      type: TipoRefeicao.JANTAR,
      dishes: [dish.body.id],
    })

    await request(app.server)
      .post(`/cardapio/${menuId}/suggests`)
      .send({
        type: TipoRefeicao.JANTAR,
        date: "2026-06-02",
      })

    const firstCall = generateContentSpy.mock.calls[0]
    if (!firstCall) {
      throw new Error("AI was not called")
    }

    const callArgs = firstCall[0] as any
    const promptText = typeof callArgs.contents === 'string'
      ? callArgs.contents
      : callArgs.contents[0].parts[0].text

    expect(promptText).toContain("Lasanha Especial")
    expect(promptText).toContain("REFEIÇÕES JÁ EXISTENTES")
  })

  it("should return 503 when Gemini API fails", async () => {
    const { ai } = await import("@/lib/gemini")

    vi.mocked(ai.models.generateContent).mockRejectedValue(
      new Error("Gemini API Error"),
    )

    const createMenu = await request(app.server).post("/cardapio").send({
      title: "Menu Erro",
      checkIn: "2026-02-01",
      checkOut: "2026-02-05",
      adults: 2,
    })

    const response = await request(app.server)
      .post(`/cardapio/${createMenu.body.menu.id}/suggests`)
      .send({
        type: TipoRefeicao.CAFE,
        date: "2026-02-01",
      })

    expect(response.status).toBe(503)
    expect(response.body.message).toBe("Serviço de IA temporariamente indisponível")
  })
})