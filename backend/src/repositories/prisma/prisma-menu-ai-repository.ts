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
      nome: z.string().min(1),
      categoria: z.enum(["CAFE_MANHA", "ALMOCO", "JANTAR", "SOBREMESA", "LANCHE"]),
      ingredientes: z.array(
        z.object({
          nome: z.string().min(1),
          quantidade: z.number().positive(),
          unidade: z.string().min(1),
          categoria: z.enum([
            "HORTIFRUTI", "PROTEINA", "LATICINIO", "GRAOS", "TEMPERO",
            "BEBIDA", "CONGELADO", "PADARIA", "HIGIENE", "OUTROS"
          ]),
        })
      ).min(1),
    })
  ).min(3).max(3),
  observacoes: z.string().min(1),
})

type GroqResponse = z.infer<typeof groqResponseSchema>

export class PrismaMenuAIRepository implements MenuAiRepository {
  async suggests(
    data: SuggestDishesInput,
    context: MenuContext,
    meals: Meal[]
  ): Promise<DishSuggestions> {
    const prompt = this.buildPrompt(data.type, context, data.date, meals)
    const aiResponse = await this.callGroqWithRetry(prompt)

    return {
      dishes: aiResponse.sugestoes.map(dish => ({
        nome: dish.nome,
        categoria: dish.categoria as CategoriaPrato,
        ingredientes: dish.ingredientes.map(ing => ({
          nome: ing.nome,
          quantidade: ing.quantidade,
          unidade: ing.unidade,
          categoria: ing.categoria as CategoriaIngrediente,
        }))
      })),
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

  private async callGroqWithRetry(prompt: string, maxRetries = 2): Promise<GroqResponse> {
    let lastError: any = null
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Tentativa ${attempt}/${maxRetries}...`)
        return await this.callGroq(prompt)
      } catch (error: any) {
        lastError = error
        if (attempt < maxRetries) {
          console.warn(`⚠️ Falha na tentativa ${attempt}, tentando novamente...`)
          await new Promise(resolve => setTimeout(resolve, 1000))
          continue
        }
      }
    }
    throw lastError
  }

  private async callGroq(prompt: string): Promise<GroqResponse> {
    const completion = await groq.chat.completions.create({
      model: GROQ_CONFIG.model,
      temperature: GROQ_CONFIG.temperature,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "Você é um chef especialista. Responda APENAS com JSON. Não use Markdown. Mantenha as categorias rigorosamente como solicitado.",
        },
        { role: "user", content: prompt },
      ],
    })

    const text = completion.choices?.[0]?.message?.content
    if (!text) throw new Error("Groq retornou vazio")

    const rawJson = JSON.parse(text)
    const sanitizedJson = this.sanitizeAiResponse(rawJson)

    const validated = groqResponseSchema.safeParse(sanitizedJson)
    if (!validated.success) {
      console.error("❌ Erro de Validação:", JSON.stringify(validated.error.format(), null, 2))
      throw new Error("Resposta da IA fora do padrão esperado")
    }

    return validated.data
  }

  private sanitizeAiResponse(data: any) {
    if (!data.observacoes || typeof data.observacoes !== 'string' || data.observacoes.trim().length === 0) {
      data.observacoes = "Sugestões preparadas para o seu cardápio em Icapuí.";
    }

    if (!data.sugestoes || !Array.isArray(data.sugestoes)) return data;

    const mapCatPrato: Record<string, string> = {
      'CAFÉ DA MANHÃ': 'CAFE_MANHA', 'CAFE DA MANHA': 'CAFE_MANHA', 'CAFE': 'CAFE_MANHA',
      'ALMOÇO': 'ALMOCO', 'ALMOCO': 'ALMOCO', 'JANTAR': 'JANTAR',
      'SOBREMESA': 'SOBREMESA', 'LANCHE': 'LANCHE'
    };

    const mapCatIng: Record<string, string> = {
      'FRUTA': 'HORTIFRUTI', 'VEGETAL': 'HORTIFRUTI', 'LEGUME': 'HORTIFRUTI', 'VERDURA': 'HORTIFRUTI',
      'CARNE': 'PROTEINA', 'PEIXE': 'PROTEINA', 'FRANGO': 'PROTEINA', 'OVO': 'PROTEINA',
      'LEITE': 'LATICINIO', 'QUEIJO': 'LATICINIO', 'IOGURTE': 'LATICINIO',
      'CEREAL': 'GRAOS', 'ARROZ': 'GRAOS', 'FEIJAO': 'GRAOS', 'MASSA': 'GRAOS',
      'TEMPEROS': 'TEMPERO', 'ESPECIARIA': 'TEMPERO', 'SAL': 'TEMPERO'
    };

    data.sugestoes = data.sugestoes.map((s: any) => {
      const categoriaLimpa = s.categoria?.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const categoriaFinal = mapCatPrato[s.categoria?.toUpperCase()] || mapCatPrato[categoriaLimpa] || 'ALMOCO';

      return {
        ...s,
        nome: s.nome || "Prato Sugerido",
        categoria: categoriaFinal,
        ingredientes: s.ingredientes?.map((i: any) => {
          const ingCatLimpa = i.categoria?.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          const ingCategoriaFinal = mapCatIng[i.categoria?.toUpperCase()] || mapCatIng[ingCatLimpa] || 'OUTROS';

          return {
            ...i,
            nome: i.nome || "Ingrediente",
            quantidade: (typeof i.quantidade !== 'number' || i.quantidade <= 0) ? 1 : i.quantidade,
            unidade: (!i.unidade || i.unidade.trim().length === 0) ? "un" : i.unidade,
            categoria: ingCategoriaFinal
          };
        })
      };
    });

    return data;
  }

  private buildPrompt(type: TipoRefeicao, context: MenuContext, date: Date, meals: Meal[]): string {
    const nomesJaUsados = meals.flatMap(m => m.pratos?.map(p => p.nome) || []).filter(Boolean);

    return `
Você é uma Chef de Cozinha em Icapuí, Ceará.
Crie 3 sugestões de pratos para ${TIPO_TEXTO[type]} no dia ${date.toLocaleDateString("pt-BR")}.

REGRAS CRÍTICAS:
1. JSON APENAS.
2. CATEGORIA DO PRATO: [CAFE_MANHA, ALMOCO, JANTAR, SOBREMESA, LANCHE].
3. CATEGORIA DO INGREDIENTE: [HORTIFRUTI, PROTEINA, LATICINIO, GRAOS, TEMPERO, BEBIDA, CONGELADO, PADARIA, HIGIENE, OUTROS].
4. UNIDADE E NOME NÃO PODEM SER VAZIOS.
5. PROIBIDO REPETIR: [${nomesJaUsados.join(", ")}].

PÚBLICO: ${context.adults} adultos e ${context.kids} crianças.
RESTRIÇÕES: ${context.restricoes.join(", ")}.
ESTILO: Comida de praia, leve e tropical.

FORMATO:
{
  "sugestoes": [
    {
      "nome": "Nome do Prato",
      "categoria": "ALMOCO",
      "ingredientes": [
        {"nome": "Item", "quantidade": 500, "unidade": "g", "categoria": "PROTEINA"}
      ]
    }
  ],
  "observacoes": "Dica do chef"
}`;
  }
}