import type { CategoriaPrato, TipoRefeicao } from "@/generated/prisma/enums"

export interface CreateMealInput {
  menuId: string
  date: Date
  type: TipoRefeicao
  dishes: string[]
}
export interface DeleteMealsParams {
  id: string
  menuId: string
}
export interface UpdateMealParams {
  mealId: string
  menuId: string
}
export interface UpdateMealInput {
  date?: Date
  type?: TipoRefeicao
  dishes?: string[]
}
export interface UpdateMealOutput {
  meal: {
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
}