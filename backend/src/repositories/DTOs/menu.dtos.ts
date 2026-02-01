import type { CategoriaPrato, TipoRefeicao } from "@/generated/prisma/client"
export interface CreateMenuInput {
  title: string
  checkIn: Date
  checkOut: Date
  adults: number
  kids?: number
  restricoes?: string[],
  preferencias?: string | undefined
}
export interface CreateMenuOutput {
  menu: {
    id: string
    titulo: string
    checkin: Date
    checkout: Date
    adultos: number
    criancas: number
    restricoes: string[]
    preferencias: string | null
    geradoPorIA: boolean
    createdAt: Date
    updatedAt: Date
  }
}
export interface FindByIdMenuParams {
  menuId: string
}
export interface FindByIdMenuOutput {
  menu: {
    id: string
    titulo: string
    checkin: Date
    checkout: Date
    adultos: number
    criancas: number
    restricoes: string[]
    preferencias: string | null
    geradoPorIA: boolean
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
    createdAt: Date
    updatedAt: Date
  }
}
export interface FindAllFiltersParams {
  titulo?: string | undefined
  data?: string | undefined
  page?: number | undefined
  limit?: number | undefined
}
export interface FindAllMenusOutput {
  menus: {
    id: string
    titulo: string
    checkin: Date
    checkout: Date
    adultos: number
    criancas: number
    restricoes: string[]
    preferencias: string | null
    geradoPorIA: boolean
    createdAt: Date
    updatedAt: Date
  }[]
  total: number
  page: number
  totalPages: number
}
export interface UpdateMenuInput {
  title?: string
  checkIn?: Date
  checkOut?: Date
  adults?: number
  kids?: number
  restricoes?: string[]
  preferencias?: string | null
}
export interface UpdateMenuOutput {
  menu: {
    id: string
    titulo: string
    checkin: Date
    checkout: Date
    adultos: number
    criancas: number
    restricoes: string[]
    preferencias: string | null
    geradoPorIA: boolean
    createdAt: Date
    updatedAt: Date
  }
}
export interface DuplicateMenuParams {
  menuId: string
}
export interface DuplicateMenuOutput {
  cardapio: {
    id: string
    titulo: string
    checkin: Date
    checkout: Date
    adultos: number
    criancas: number
    restricoes: string[]
    preferencias: string | null
    geradoPorIA: boolean
    createdAt: Date
    updatedAt: Date
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
}

export interface DeleteMenuParams {
  id: string
}