import type { TipoRefeicao } from "@/generated/prisma/enums"
import { model } from "@/lib/gemini"
import type {
  DishSuggestions,
  MenuContext,
  SuggestDishesInput,
  SuggestDishesParams,
} from "../DTOs/ai.dtos"
import type { FindByIdMenuOutput } from "../DTOs/menu.dtos"
import type { MenuAiRepository } from "../menu-ai-repository"

type Refeicao = FindByIdMenuOutput["menu"]["refeicoes"][number]

const TIPO_TEXTO: Record<TipoRefeicao, string> = {
  CAFE: "CAFÉ DA MANHÃ",
  ALMOCO: "ALMOÇO",
  JANTAR: "JANTAR",
}

const QUANTIDADE_SUGESTOES: Record<TipoRefeicao, string> = {
  CAFE: "4-6",
  ALMOCO: "5-7",
  JANTAR: "3-5",
}

interface GeminiResponse {
  sugestoes: string[]
  observacoes: string
}

export class PrismaMenuAIRepository implements MenuAiRepository {
  async suggests(
    _params: SuggestDishesParams,
    data: SuggestDishesInput,
  ): Promise<DishSuggestions> {
    const { type, context, date, refeicoes } = data

    const prompt = this.buildPrompt(type, context, date, refeicoes)
    const aiResponse = await this.callGemini(prompt)

    return {
      suggestions: aiResponse.sugestoes,
      context: {
        menu: data.context.title,
        type: data.type,
        ...(data.date && { date: data.date }),
        people: {
          adults: data.context.adults,
          kids: data.context.kids,
          total: data.context.adults + data.context.kids,
        },
        restricoes: data.context.restricoes,
        ...(data.context.preferencias && {
          preferencias: data.context.preferencias,
        }),
      },
      notes: aiResponse.observacoes,
    }
  }

  private async callGemini(prompt: string): Promise<GeminiResponse> {
    try {
      const result = await model.generateContent(prompt)
      const text = result.response.text()

      const jsonText = text.replace(/```json\n?|\n?```/g, "").trim()

      return JSON.parse(jsonText)
    } catch {
      throw new Error("Serviço de IA temporariamente indisponível")
    }
  }

  private buildPrompt(
    type: TipoRefeicao,
    context: MenuContext,
    date: Date,
    refeicoes: Refeicao[],
  ): string {
    const checkinFormatted = context.checkin.toLocaleDateString("pt-BR")
    const checkoutFormatted = context.checkout.toLocaleDateString("pt-BR")
    const dateFormatted = date.toLocaleDateString("pt-BR")

    const restricoesLines =
      context.restricoes.length > 0
        ? context.restricoes
          .map((r) => `- OBRIGATÓRIO: Respeitar "${r}"`)
          .join("\n")
        : "- Sem restrições alimentares"

    return `Você é um chef especializado em casas de praia.

CONTEXTO DO CARDÁPIO:
- Título: ${context.title}
- Período: ${checkinFormatted} a ${checkoutFormatted}
- Pessoas: ${context.adults} adultos e ${context.kids} crianças
- Restrições: ${context.restricoes.length > 0
        ? context.restricoes.join(", ")
        : "Nenhuma"
      }
${context.preferencias ? `- Preferências: ${context.preferencias}` : ""}
- Local: Casa de praia (clima quente, tropical)

REFEIÇÕES JÁ CADASTRADAS NO CARDÁPIO:
${this.formatRefeicoes(refeicoes)}

TAREFA:
Sugira ${QUANTIDADE_SUGESTOES[type]} pratos para ${TIPO_TEXTO[type]
      } do dia ${dateFormatted}.

REGRAS:
- Pratos leves e refrescantes (clima de praia)
${restricoesLines}
- Comida caseira e simples
- Adequado para crianças
- Evitar repetição de pratos já cadastrados

FORMATO DE RESPOSTA (apenas JSON válido, sem markdown):
{
  "sugestoes": ["prato1", "prato2", "prato3"],
  "observacoes": "breve explicação considerando contexto, restrições e variedade"
}`
  }

  private formatRefeicoes(refeicoes: Refeicao[]): string {
    if (refeicoes.length === 0) {
      return "- Nenhuma refeição cadastrada ainda."
    }

    return refeicoes
      .map((refeicao) => {
        const data = refeicao.data.toLocaleDateString("pt-BR")
        const tipo = TIPO_TEXTO[refeicao.tipo]
        const pratos =
          refeicao.pratos.length > 0
            ? refeicao.pratos.map((p) => p.nome).join(", ")
            : "Sem pratos"

        return `- ${data} | ${tipo}: ${pratos}`
      })
      .join("\n")
  }
}
