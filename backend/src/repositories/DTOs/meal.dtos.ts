import type { TipoRefeicao } from "@/generated/prisma/enums"

export interface CreateMealInput {
  menuId: string
  date: Date
  type: TipoRefeicao
  dishes: string[]
}
