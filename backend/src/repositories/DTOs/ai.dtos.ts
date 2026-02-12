import type { CategoryOfDish, CategoryOfIngredient, TypeOfMeal } from "@/generated/prisma/enums"

export interface SuggestDishesParams {
  menuId: string
}

export interface SuggestDishesInput {
  type: TypeOfMeal
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
  child?: number
  restrictions: string[]
  preferences: string
  checkin: Date
  checkout: Date
}

export interface AISuggestedIngredient {
  name: string
  quantify: number
  unit: string
  category: CategoryOfIngredient
}

export interface AISuggestedDish {
  name: string
  category: CategoryOfDish
  ingredients: AISuggestedIngredient[]
}

export interface DishSuggestions {
  dishes: AISuggestedDish[]
  context: {
    menu: string
    type: TypeOfMeal
    date?: Date
    people: {
      adults: number
      child: number
      total: number
    }
    restrictions: string[]
    preferences?: string
  }
  notes: string
}

export interface RegeneratedDishSuggestions extends DishSuggestions {
  remainingRegenerations?: number
}

export interface AcceptSuggestionInput {
  date: Date
  type: TypeOfMeal
  dishes: AISuggestedDish[]
}

export interface AcceptSuggestionParams {
  menuId: string
}
export interface VariationContext {
  type: TypeOfMeal
  restrictions: string[]
  preferences: string
}
export interface SuggestVariationsInput {
  context: VariationContext
}
export interface SuggestsVariationsParams {
  originalDish: string
  menuId: string
}
export interface VariationSuggestionsResponse {
  dishes: AISuggestedDish[]
  category: string
  notes: string
}

export interface AcceptVariationInput {
  sugestaoEscolhida: {
    nome: string
    category: CategoryOfDish
    ingredients: Array<{
      name: string
      quantify: number
      unit: string
      category: CategoryOfIngredient
    }>
  }
}
export interface AcceptVariationParams {
  menuId: string
  mealId: string
  oldPlateId: string
}