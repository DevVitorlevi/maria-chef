import { config } from "dotenv"
import { describe, expect, it } from "vitest"
import { TipoRefeicao } from "../../src/generated/prisma/enums"
import { PrismaMenuAIRepository } from "../../src/repositories/prisma/prisma-menu-ai-repository"

config()

describe("Groq API Real Integration Test — Menu AI Suggests", () => {

  it(
    "should generate contextual suggestions avoiding restrictions and repetitions",
    async () => {

      if (!process.env.GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY não definida — teste real não pode rodar")
      }

      const repository = new PrismaMenuAIRepository()

      const menuContext = {
        id: "real-test-menu-id",
        title: "Férias de Verão - Icapuí",
        adults: 6,
        kids: 3,
        restricoes: [
          "Restrição a pimenta para as crianças",
        ],
        preferencias:
          "O Hospede Prefere peixes e frutos do mar, mas tbm esta aberto a pratos com carne",
        checkin: new Date("2026-02-01"),
        checkout: new Date("2026-02-10"),
      }

      const existingMeals = [
        {
          id: "meal-1",
          data: new Date("2026-02-01"),
          tipo: TipoRefeicao.ALMOCO,
          pratos: [
            { id: "p1", nome: "Feijoada Completa", categoria: "ALMOCO" },
            { id: "p2", nome: "Pizza", categoria: "LANCHE" },
          ],
        },
        {
          id: "meal-2",
          data: new Date("2026-02-02"),
          tipo: TipoRefeicao.JANTAR,
          pratos: [
            { id: "p3", nome: "Espaguete à Bolonhesa", categoria: "JANTAR" },
          ],
        },
      ]

      const input = {
        type: TipoRefeicao.ALMOCO,
        date: new Date("2026-02-03"),
      }

      console.log("🚀 Enviando contexto real para a IA (Groq)...")
      console.log("📋 Contexto do menu:", menuContext)
      console.log("🍽️ Refeições existentes:", existingMeals)
      console.log("📅 Tipo e data da sugestão:", input)

      const result = await repository.suggests(
        input,
        menuContext,
        existingMeals as any
      )

      console.log("📝 Resposta completa da IA:", result)

      expect(result).toBeDefined()
      expect(result.suggestions).toBeInstanceOf(Array)
      expect(result.suggestions.length).toBeGreaterThanOrEqual(3)

      for (const s of result.suggestions) {
        expect(typeof s).toBe("string")
        expect(s.length).toBeGreaterThan(2)
      }

      const text = result.suggestions.join(" ").toLowerCase()

      const forbidden = ["feijoada completa", "feijoada"]
      const repeated = forbidden.some((f) => text.includes(f))

      expect(repeated).toBe(false)

      expect(result.context.people.total).toBe(9)
    },
    35000
  )
})
