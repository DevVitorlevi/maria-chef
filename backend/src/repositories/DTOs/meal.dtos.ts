import type { CategoryOfDish, CategoryOfIngredient, TypeOfMeal } from "@/generated/prisma/enums"
import type { Decimal } from "@prisma/client/runtime/client"

export interface CreateMealInput {
  menuId: string
  date: Date
  type: TypeOfMeal
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
  type?: TypeOfMeal
  dishes?: string[]
}
export interface UpdateMealOutput {
  meal: {
    id: string
    menuId: string
    date: Date
    type: TypeOfMeal
    dishes: Array<{
      id: string
      name: string
      category: CategoryOfDish
      createdAt: Date
    }>
    createdAt: Date
  }
}
export interface FindByIdMealParams {
  id: string
  menuId: string
}
export interface FindByIdMealOutput {
  meal: {
    id: string
    menuId: string
    date: Date
    type: TypeOfMeal
    dishes: Array<{
      id: string
      name: string
      category: CategoryOfDish
      createdAt: Date
      ingredients: {
        id: string
        dishId: string
        name: string
        quantify: Decimal
        unit: string
        category: CategoryOfIngredient
      }[]
    }>
    createdAt: Date
  }
}