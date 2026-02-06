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
export interface CreateMealFromSuggestionInput {
  menuId: string
  date: Date
  type: TipoRefeicao
  dishes: AISuggestedDish[]
}