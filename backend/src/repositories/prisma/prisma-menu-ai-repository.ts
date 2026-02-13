import type { Meal } from "@/@types/menu"
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

import type { TypeOfMeal } from "@/generated/prisma/enums"
import type { MenuAiRepository } from "../menu-ai-repository"

const MEAL_TYPE_TEXT: Record<TypeOfMeal, string> = {
  BREAKFAST: "CAFÉ DA MANHÃ",
  SNACK: "LANCHE",
  LUNCH: "ALMOÇO",
  DESERT: "SOBREMESA",
  DINNER: "JANTAR",
}

const groqResponseSchema = z.object({
  suggestions: z.array(
    z.object({
      name: z.string().min(1),
      category: z.enum(["BREAKFAST", "LUNCH", "DINNER", "DESERT", "SNACK"]),
      ingredients: z.array(
        z.object({
          name: z.string().min(1),
          quantity: z.number().positive(),
          unit: z.string().min(1),
          category: z.enum([
            "PRODUCE", "PROTEIN", "DAIRY", "GRAIN", "CEREAL",
            "MASS", "FARINACEUS", "OIL", "CANNED", "SAUCES",
            "MORNING", "BAKING", "TEMPERO", "SNACKS", "CANDY", "OUTROS"
          ]),
        })
      ).min(1),
    })
  ).min(1),
  notes: z.string().min(1),
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

  async variations(originalDish: string, data: SuggestVariationsInput): Promise<VariationSuggestionsResponse> {
    if (!data || !data.context) throw new Error("Context is required")

    const { context } = data
    const prompt = `
      You are a Professional Chef. The user wants variations for the dish "${originalDish}".
      Suggest 3 to 5 COMPLETE variations.

      RULES:
      1. Names and Notes must be in PORTUGUESE (PT-BR).
      2. Specific cuts: specify if it's "Filé de Peito", "Pargo", "Picanha", etc.
      3. Response must be JSON using these Ingredient categories: [PRODUCE, PROTEIN, DAIRY, GRAIN, CEREAL, MASS, FARINACEUS, OIL, CANNED, SAUCES, MORNING, BAKING, TEMPERO, SNACKS, CANDY, OUTROS].
      
      CONTEXT:
      - Type: ${MEAL_TYPE_TEXT[context.type]}
      - Constraints: ${context.restrictions?.join(", ") || "None"}
      - Preferences: ${context.preferences || "None"}

      JSON Structure:
      {
        "suggestions": [
          {
            "name": "Nome do Prato",
            "category": "LUNCH",
            "ingredients": [
              {"name": "Ingrediente", "quantity": 100, "unit": "g", "category": "PROTEIN"}
            ]
          }
        ],
        "notes": "Explicação técnica em português."
      }
    `
    const aiResponse = await this.callGroqWithRetry(prompt, groqResponseSchema)

    return {
      dishes: aiResponse.suggestions.map(dish => ({
        name: dish.name,
        category: dish.category,
        ingredients: dish.ingredients.map(ing => ({
          name: ing.name,
          quantify: ing.quantity,
          unit: ing.unit,
          category: ing.category,
        }))
      })),
      category: `Variações para ${originalDish}`,
      notes: aiResponse.notes
    }
  }

  private mapAiResponseToDishSuggestions(
    aiResponse: GroqResponse,
    data: SuggestDishesInput,
    context: MenuContext
  ): DishSuggestions {
    return {
      dishes: aiResponse.suggestions.map(dish => ({
        name: dish.name,
        category: dish.category,
        ingredients: dish.ingredients.map(ing => ({
          name: ing.name,
          quantify: ing.quantity,
          unit: ing.unit,
          category: ing.category,
        }))
      })),
      context: {
        menu: context.title,
        type: data.type,
        people: {
          adults: context.adults,
          child: context.child ?? 0,
          total: context.adults + (context.child ?? 0),
        },
        restrictions: context.restrictions ?? [],
        preferences: context.preferences ?? undefined,
        date: data.date,
      },
      notes: aiResponse.notes,
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
          await new Promise(resolve => setTimeout(resolve, 1500))
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
          content: "You are an expert Chef. All 'name' and 'notes' must be in BRAZILIAN PORTUGUESE. Enum values must be in ENGLISH as defined in the schema.",
        },
        { role: "user", content: prompt },
      ],
    })

    const text = completion.choices?.[0]?.message?.content
    if (!text) throw new Error("Empty AI response")

    return schema.parse(JSON.parse(text))
  }

  private buildPrompt(type: TypeOfMeal, context: MenuContext, date: Date, meals: Meal[], previous: string[] = []): string {
    const blacklist = [...new Set([...meals.flatMap(m => m.dishes?.map(d => d.name) || []), ...previous])];

    return `
      Create menu suggestions for ${MEAL_TYPE_TEXT[type]} on ${date.toLocaleDateString("pt-BR")}.
      
      TECHNICAL REQUIREMENTS:
      - Use JSON only.
      - Dish names and notes in PORTUGUESE.
      - Ingredient categories MUST BE one of: [PRODUCE, PROTEIN, DAIRY, GRAIN, CEREAL, MASS, FARINACEUS, OIL, CANNED, SAUCES, MORNING, BAKING, TEMPERO, SNACKS, CANDY, OUTROS].
      - Do not suggest: [${blacklist.join(", ")}].
      - Context: ${context.adults} adults, ${context.child ?? 0} child. Restrictions: ${context.restrictions?.join(", ") || "None"}.
      
      Example of ONE ingredient: {"name": "Arroz Integral", "quantity": 200, "unit": "g", "category": "GRAIN"}
    `
  }
}