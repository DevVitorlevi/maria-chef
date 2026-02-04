import type { TipoRefeicao } from "@/generated/prisma/enums"
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
  kids: number
  restricoes: string[]
  preferencias?: string | undefined
  checkin: Date
  checkout: Date
}
export interface DishSuggestions {
  suggestions: string[]
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