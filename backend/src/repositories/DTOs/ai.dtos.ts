import type {
  CategoriaIngrediente,
  CategoriaPrato,
  TipoRefeicao
} from "@/generated/prisma/enums"

export interface SuggestDishesParams {
  menuId: string
}

export interface SuggestDishesInput {
  type: TipoRefeicao
  date: Date
}

export interface RegenerateSuggestionsParams extends SuggestDishesParams { }

export interface RegenerateSuggestionsInput extends SuggestDishesInput {
  previousSuggestions: string[]
}

export interface MenuContext {
  id: string
  title: string
  adults: number
  kids?: number
  restricoes: string[]
  preferencias: string
  checkin: Date
  checkout: Date
}

export interface AISuggestedIngredient {
  nome: string
  quantidade: number
  unidade: string
  categoria: CategoriaIngrediente
}

export interface AISuggestedDish {
  nome: string
  categoria: CategoriaPrato
  ingredientes: AISuggestedIngredient[]
}

export interface DishSuggestions {
  dishes: AISuggestedDish[]
  context: {
    menu: string
    type: TipoRefeicao
    date?: Date
    people: {
      adults: number
      kids: number
      total: number
    }
    restricoes: string[]
    preferencias?: string
  }
  notes: string
}

export interface RegeneratedDishSuggestions extends DishSuggestions {
  remainingRegenerations?: number
}

export interface CreateMealFromSuggestionInput {
  menuId: string
  date: Date
  type: TipoRefeicao
  dishes: AISuggestedDish[]
}
export interface VariationContext {
  tipo: TipoRefeicao
  restricoes: string[]
  preferencias: string
}
export interface SuggestVariationsInput {
  pratoOriginal: string
  contexto: VariationContext
}
export interface VariationSuggestionsResponse {
  dishes: AISuggestedDish[]
  categoria: string
  notes: string
}

export interface AcceptVariationInput {
  menuId: string
  sugestaoEscolhida: {
    nome: string
    categoria: CategoriaPrato
    ingredientes: Array<{
      nome: string
      quantidade: number
      unidade: string
      categoria: CategoriaIngrediente
    }>
  }
}
export interface AcceptVariationParams {
  menuId: string
  mealId: string
  oldPlateId: string
}