import type { Meal } from "@/@types/menu"
import { TipoRefeicao } from "@/generated/prisma/enums"
import { groq, GROQ_CONFIG } from "@/lib/groq"
import { z } from "zod"

import type {
  DishSuggestions,
  MenuContext,
  SuggestDishesInput
} from "../DTOs/ai.dtos"

import type { MenuAiRepository } from "../menu-ai-repository"

const TIPO_TEXTO: Record<TipoRefeicao, string> = {
  CAFE: "CAFÉ DA MANHÃ",
  ALMOCO: "ALMOÇO",
  JANTAR: "JANTAR",
}

const groqResponseSchema = z.object({
  sugestoes: z.array(z.string()).min(1),
  observacoes: z.string().min(1),
})

type GroqResponse = z.infer<typeof groqResponseSchema>

export class PrismaMenuAIRepository implements MenuAiRepository {

  async suggests(
    data: SuggestDishesInput,
    context: MenuContext,
    meals: Meal[]
  ): Promise<DishSuggestions> {

    const prompt = this.buildPrompt(
      data.type,
      context,
      data.date,
      meals
    )

    const aiResponse = await this.callGroq(prompt)

    return {
      suggestions: aiResponse.sugestoes,
      context: {
        menu: context.title,
        type: data.type,
        people: {
          adults: context.adults,
          kids: context.kids,
          total: context.adults + context.kids,
        },
        restricoes: context.restricoes,
        ...(context.preferencias && {
          preferencias: context.preferencias,
        }),
        ...(data.date && { date: data.date }),
      },
      notes: aiResponse.observacoes,
    }
  }

  private async callGroq(prompt: string): Promise<GroqResponse> {
    try {
      const completion = await groq.chat.completions.create({
        model: GROQ_CONFIG.model,
        temperature: GROQ_CONFIG.temperature,
        max_tokens: GROQ_CONFIG.max_tokens,
        messages: [
          {
            role: "system",
            content:
              "Você é um chef especialista em cardápios de casas de praia. Responda SOMENTE em JSON válido.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      })

      const text = completion.choices?.[0]?.message?.content

      if (!text) {
        throw new Error("Groq retornou vazio")
      }

      const jsonMatch = text.match(/\{[\s\S]*\}/)

      if (!jsonMatch) {
        throw new Error("Resposta não contém JSON")
      }

      const parsed = JSON.parse(jsonMatch[0])

      if (Array.isArray(parsed.sugestoes)) {
        parsed.sugestoes = parsed.sugestoes.map((s: any) =>
          typeof s === "string"
            ? s
            : s?.nome ?? String(s)
        )
      }

      return groqResponseSchema.parse(parsed)

    } catch (error: any) {
      console.error("ERRO_GROQ_AI:", error?.message || error)
      throw new Error("Serviço de IA temporariamente indisponível")
    }
  }

  private buildPrompt(
    type: TipoRefeicao,
    context: MenuContext,
    date: Date,
    meals: Meal[]
  ): string {

    const dataFormatada = date.toLocaleDateString("pt-BR")

    const refeicoesExistentes =
      meals.length > 0
        ? meals.map(m => {
          const pratos =
            m.pratos?.map(p => p.nome).join(", ")
            || "Sem pratos cadastrados"

          return `${TIPO_TEXTO[m.tipo]} (${m.data.toLocaleDateString("pt-BR")}): ${pratos}`
        }).join(" | ")
        : "Nenhuma"

    return `
CONTEXTO:
Cardápio "${context.title}"
Pessoas: ${context.adults} adultos e ${context.kids} crianças

REFEIÇÕES JÁ EXISTENTES:
${refeicoesExistentes}

TAREFA:
Sugira 3 pratos criativos para o ${TIPO_TEXTO[type]} do dia ${dataFormatada}.

RESTRIÇÕES:
${context.restricoes.join(", ") || "Nenhuma"}

PREFERÊNCIAS:
${context.preferencias || "Nenhuma"}

REGRAS:
- Não repetir pratos existentes
- Adequado para casa de praia
- Considerar crianças

RESPONDA SOMENTE EM JSON:

{
  "sugestoes": ["Prato 1", "Prato 2", "Prato 3"],
  "observacoes": "Motivo das escolhas"
}
`
  }
}
