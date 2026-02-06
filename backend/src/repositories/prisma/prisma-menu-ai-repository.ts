import type { Meal } from "@/@types/menu"
import { TipoRefeicao, type CategoriaIngrediente, type CategoriaPrato } from "@/generated/prisma/enums"
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
  sugestoes: z.array(
    z.object({
      nome: z.string(),
      categoria: z.string(),
      ingredientes: z.array(
        z.object({
          nome: z.string(),
          quantidade: z.number(),
          unidade: z.string(),
          categoria: z.string(),
        })
      ),
    })
  ),
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

    const suggestions = aiResponse.sugestoes.map(dish => ({
      nome: dish.nome,
      categoria: dish.categoria as CategoriaPrato,
      ingredientes: dish.ingredientes.map(ing => ({
        nome: ing.nome,
        quantidade: ing.quantidade,
        unidade: ing.unidade,
        categoria: ing.categoria as CategoriaIngrediente,
      }))
    }))

    return {
      dishes: suggestions,
      context: {
        menu: context.title,
        type: data.type,
        people: {
          adults: context.adults,
          kids: context.kids ?? 0,
          total: context.adults + (context.kids ?? 0),
        },
        restricoes: context.restricoes,
        ...(context.preferencias && { preferencias: context.preferencias }),
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
              "Você é um chef especialista em cardápios de casas de praia. Responda SOMENTE em JSON válido com pratos e ingredientes.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      })

      const text = completion.choices?.[0]?.message?.content
      if (!text) throw new Error("Groq retornou vazio")

      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error("Resposta não contém JSON")

      const parsed = JSON.parse(jsonMatch[0])
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
    const refeicoesExistentes = meals.length
      ? meals.map(m => {
        const pratos = m.pratos?.map(p => p.nome).join(", ") || "Sem pratos cadastrados"
        return `${TIPO_TEXTO[m.tipo]} (${m.data.toLocaleDateString("pt-BR")}): ${pratos}`
      }).join(" | ")
      : "Nenhuma"

    return `
CONTEXTO:
Cardápio "${context.title}"
Pessoas: ${context.adults} adultos e ${context.kids ?? 0} crianças

REFEIÇÕES JÁ EXISTENTES:
${refeicoesExistentes}

TAREFA:
Sugira 3 pratos criativos para o ${TIPO_TEXTO[type]} do dia ${dataFormatada} e inclua os ingredientes de cada prato, quantidade e unidade.

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
  "sugestoes": [
    {
      "nome": "Prato 1",
      "categoria": "ALMOCO",
      "ingredientes": [
        { "nome": "Ingrediente 1", "quantidade": 100, "unidade": "g", "categoria": "TEMPERO" }
      ]
    }
  ],
  "observacoes": "Motivo das escolhas"
}
`
  }
}
