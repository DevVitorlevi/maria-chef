import type { Meal } from "@/@types/menu"
import { TipoRefeicao } from "@/generated/prisma/enums"
import { ai, GEMINI_CONFIG } from "@/lib/gemini"
import { z } from "zod"
import type { DishSuggestions, MenuContext, SuggestDishesInput } from "../DTOs/ai.dtos"
import type { MenuAiRepository } from "../menu-ai-repository"

const TIPO_TEXTO: Record<TipoRefeicao, string> = {
  CAFE: "CAFÉ DA MANHÃ",
  ALMOCO: "ALMOÇO",
  JANTAR: "JANTAR",
}

const geminiResponseSchema = z.object({
  sugestoes: z.array(z.string()),
  observacoes: z.string()
})

type GeminiResponse = z.infer<typeof geminiResponseSchema>

export class PrismaMenuAIRepository implements MenuAiRepository {
  async suggests(
    data: SuggestDishesInput,
    context: MenuContext,
    meals: Meal[]
  ): Promise<DishSuggestions> {
    const prompt = this.buildPrompt(data.type, context, data.date, meals)
    const aiResponse = await this.callGemini(prompt)

    return {
      suggestions: aiResponse.sugestoes,
      context:
      {
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

  private async callGemini(prompt: string): Promise<GeminiResponse> {
    try {
      const response = await ai.models.generateContent({
        model: GEMINI_CONFIG.model,
        contents: prompt,
        config: GEMINI_CONFIG.config
      })

      const text = response.text

      if (!text) throw new Error("IA retornou vazio")

      return geminiResponseSchema.parse(JSON.parse(text))
    } catch (error: any) {
      console.error("ERRO_GEMINI_3:", error.message || error)
      throw new Error("Serviço de IA temporariamente indisponível")
    }
  }

  private buildPrompt(type: TipoRefeicao, context: MenuContext, date: Date, meals: Meal[]): string {
    const dataFormatada = date.toLocaleDateString("pt-BR")
    const refeicoesExistentes = meals.length > 0
      ? meals.map(m => {
        const pratos = m.pratos?.map(p => p.nome).join(", ") || "Sem pratos cadastrados"
        return `${TIPO_TEXTO[m.tipo]} (${m.data.toLocaleDateString("pt-BR")}): ${pratos}`
      }).join(" | ")
      : "Nenhuma"

    return `Você é um chef especializado em casas de praia.
    CONTEXTO: Cardápio "${context.title}", para ${context.adults} adultos e ${context.kids} crianças.
    REFEIÇÕES JÁ EXISTENTES: ${refeicoesExistentes}
    
    TAREFA: Sugira pratos criativos para o ${TIPO_TEXTO[type]} do dia ${dataFormatada}.
    RESTRIÇÕES ALIMENTARES: ${context.restricoes.join(", ") || "Nenhuma"}
    PREFERÊNCIAS DO CLIENTE: ${context.preferencias || "Nenhuma"}

    REQUISITO: Não repita pratos que já existam nas refeições listadas acima.
    FORMATO DE RESPOSTA (JSON):
    {
      "sugestoes": ["Nome do Prato 1", "Nome do Prato 2", "Nome do Prato 3"],
      "observacoes": "Explicação rápida de por que escolheu esses pratos."

    }`
  }
}