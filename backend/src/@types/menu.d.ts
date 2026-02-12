import type { CategoryOfDish, TypeOfMeal } from "@/generated/prisma/enums"

export type Menu = {
  id: string
  title: string
  checkin: Date
  checkout: Date
  adults: number
  child: number
  restrictions: string[]
  preferences: string | null
  createdAt: Date
  updatedAt: Date
  meals: Meal[]
}

export type Meal = {
  id: string
  menuId: string
  date: Date
  type: TypeOfMeal
  dishes: Array<{
    id: string
    name: string
    category: CategoryOfDish
    createdAt: Date
    ingredients: Array<{
      name: string
      quantify: number
      unit: string
      category: CategoriaIngrediente
    }>
  }>
  createdAt: Date
}

