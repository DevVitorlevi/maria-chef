import type { CategoriaPrato, TipoRefeicao } from "@/generated/prisma/enums"

export type Menu = {
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
  refeicoes: Meal[]
}
export type Meal = {
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
}

