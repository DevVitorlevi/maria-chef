import type { CategoriaPrato, TipoRefeicao } from "@/generated/prisma/enums"

export interface SuggestDishesParams {
  menuId: string
}

export interface MenuContext {
  id: string
  title: string
  adults: number
  kids: number
  restricoes: string[]
  preferencias?: string
  checkin: Date
  checkout: Date
}

export interface SuggestDishesInput {
  type: TipoRefeicao
  date: Date
  context: MenuContext
  refeicoes: Array<{
    id: string
    cardapioId: string
    data: Date
    tipo: TipoRefeicao
    pratos: Array<{
      id: string
      nome: string
      categoria: CategoriaPrato
      createdAt: Date
    }>
    createdAt: Date
  }>
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
