import type { Meal } from "@/@types/menu"
import { TipoRefeicao, type CategoriaIngrediente, type CategoriaPrato } from "@/generated/prisma/enums"
import { groq, GROQ_CONFIG } from "@/lib/groq"
import { z } from "zod"

import type {
  DishSuggestions,
  MenuContext,
  RegenerateSuggestionsInput,
  SuggestDishesInput,
  SuggestVariationsInput,
  VariationSuggestionsResponse
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
  ).min(1),
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
    const aiResponse = await this.callGroqWithRetry(prompt, groqResponseSchema)

    return this.mapAiResponseToDishSuggestions(aiResponse, data, context)
  }

  async regenerate(
    data: RegenerateSuggestionsInput,
    context: MenuContext,
    meals: Meal[]
  ): Promise<DishSuggestions> {
    const prompt = this.buildPrompt(data.type, context, data.date, meals, data.previousSuggestions)
    const aiResponse = await this.callGroqWithRetry(prompt, groqResponseSchema)

    return this.mapAiResponseToDishSuggestions(aiResponse, data, context)
  }

  async variations(data: SuggestVariationsInput): Promise<VariationSuggestionsResponse> {
    const prompt = `
      Você é um Chef de Cozinha. O usuário deseja variar o prato "${data.pratoOriginal}".
      Sugira de 3 a 5 variações ou substituições COMPLETAS (com ingredientes).

      DIRETRIZES TÉCNICAS (OBRIGATÓRIO):
      1. ESPECIFIQUE OS ITENS: Nunca use apenas "Peixe", "Carne" ou "Acompanhamento".
      2. CORTE/ESPÉCIE: Nomeie o corte (Ex: Maminha, Filé de Peito, Sobrecoxa) ou a espécie (Ex: Pargo, Sirigado, Camarão Rosa).
      3. NATURALIDADE: Não fique repetindo nomes de cidades ou estados nos pratos (Ex: use apenas "Castanha de Caju" em vez de "Castanha do Ceará").
      
      CONTEXTO:
      - Tipo: ${TIPO_TEXTO[data.contexto.tipo]}
      - Restrições: ${data.contexto.restricoes.join(", ")}
      - Preferências: ${data.contexto.preferencias}

      Responda APENAS com JSON:
      {
        "sugestoes": [
          {
            "nome": "Nome do Prato",
            "categoria": "ALMOCO",
            "ingredientes": [
              {"nome": "Item Específico", "quantidade": 150, "unidade": "g", "categoria": "PROTEINA"}
            ]
          }
        ],
        "observacoes": "Por que estas variações são boas substitutas para ${data.pratoOriginal}."
      }
    `
    const aiResponse = await this.callGroqWithRetry(prompt, groqResponseSchema)

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
      categoria: `Variações para ${data.pratoOriginal}`,
      notes: aiResponse.observacoes
    }
  }

  private mapAiResponseToDishSuggestions(
    aiResponse: GroqResponse,
    data: SuggestDishesInput,
    context: MenuContext
  ): DishSuggestions {
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

  private async callGroqWithRetry<T>(prompt: string, schema: z.Schema<T>, maxRetries = 2): Promise<T> {
    let lastError: any = null
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.callGroq(prompt, schema)
      } catch (error: any) {
        lastError = error
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000))
          continue
        }
      }
    }
    throw lastError
  }

  private async callGroq<T>(prompt: string, schema: z.Schema<T>): Promise<T> {
    const completion = await groq.chat.completions.create({
      model: GROQ_CONFIG.model,
      temperature: GROQ_CONFIG.temperature,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "Você é um chef especialista. Responda APENAS com JSON. Não use Markdown.",
        },
        { role: "user", content: prompt },
      ],
    })

    const text = completion.choices?.[0]?.message?.content
    if (!text) throw new Error("Groq retornou vazio")

    const rawJson = JSON.parse(text)
    const sanitizedJson = this.sanitizeAiResponse(rawJson)

    const validated = schema.safeParse(sanitizedJson)
    if (!validated.success) {
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

  private buildPrompt(type: TipoRefeicao, context: MenuContext, date: Date, meals: Meal[], previousSuggestions: string[] = []): string {
    const nomesJaUsados = meals.flatMap(m => m.pratos?.map(p => p.nome) || []).filter(Boolean);
    const listaNegra = [...new Set([...nomesJaUsados, ...previousSuggestions])];

    return `
      Você é um Chef de Cozinha. Crie sugestões de pratos para ${TIPO_TEXTO[type]} no dia ${date.toLocaleDateString("pt-BR")}.

      REGRAS DE NOMENCLATURA:
      1. ESPECIFIQUE O CORTE/ESPÉCIE: Nomeie exatamente o que será usado (Ex: Maminha, Lombo Suíno, Tilápia, Pargo, Polvo).
      2. EVITE REPETIÇÕES GEOGRÁFICAS: Não adicione "de Icapuí" ou "do Ceará" aos nomes dos pratos ou ingredientes. Seja direto e elegante.
      3. INGREDIENTES LOCAIS: Use ingredientes como coco, castanha, macaxeira e frutos do mar de forma natural na composição.

      REGRAS TÉCNICAS:
      - JSON APENAS.
      - CATEGORIA DO PRATO: [CAFE_MANHA, ALMOCO, JANTAR, SOBREMESA, LANCHE].
      - CATEGORIA DO INGREDIENTE: [HORTIFRUTI, PROTEINA, LATICINIO, GRAOS, TEMPERO, BEBIDA, CONGELADO, PADARIA, HIGIENE, OUTROS].
      - PROIBIDO REPETIR: [${listaNegra.join(", ")}].

      PÚBLICO: ${context.adults} adultos e ${context.kids ?? 0} crianças.
      RESTRIÇÕES: ${context.restricoes.join(", ")}.

      FORMATO:
      {
        "sugestoes": [
          {
            "nome": "Ex: Maminha Grelhada com Risoto de Cogumelos",
            "categoria": "ALMOCO",
            "ingredientes": [
              {"nome": "Maminha", "quantidade": 500, "unidade": "g", "categoria": "PROTEINA"}
            ]
          }
        ],
        "observacoes": "Dica técnica do chef sobre o preparo."
      }`;
  }
}