import type { Prato } from "@/generated/prisma/client"
import type { TipoRefeicao } from "@/generated/prisma/enums"

export interface CreateMealInput {
  menuId: string
  date: Date
  type: TipoRefeicao
  dishes: string[]
}

export interface CreateMealOutput {
  meal: {
    id: string
    data: Date
    tipo: TipoRefeicao
    pratos: Prato[]
  }
}