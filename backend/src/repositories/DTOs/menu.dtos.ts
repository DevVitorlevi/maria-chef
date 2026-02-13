import type { CategoryOfDish, TypeOfMeal } from "@/generated/prisma/enums"

export interface CreateMenuInput {
  title: string
  checkIn: Date
  checkOut: Date
  adults: number
  child?: number
  restrictions?: string[],
  preferences?: string | undefined
}
export interface CreateMenuOutput {
  menu: {
    id: string
    title: string
    checkin: Date
    checkout: Date
    adults: number
    child: number
    restrictions: string[]
    preferences: string
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
    title: string
    checkin: Date
    checkout: Date
    adults: number
    child: number
    restrictions: string[]
    preferences: string
    meals: Array<{
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
    }>
    createdAt: Date
    updatedAt: Date
  }
}
export interface FindAllFiltersParams {
  title?: string | undefined
  date?: string | undefined
  page?: number | undefined
  limit?: number | undefined
}
export interface FindAllMenusOutput {
  menus: {
    id: string
    title: string
    checkin: Date
    checkout: Date
    adults: number
    child: number
    restrictions: string[]
    preferences: string
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
  child?: number
  restrictions?: string[]
  preferences?: string
}
export interface UpdateMenuOutput {
  menu: {
    id: string
    title: string
    checkin: Date
    checkout: Date
    adults: number
    child: number
    restrictions: string[]
    preferences: string
    createdAt: Date
    updatedAt: Date
  }
}
export interface DuplicateMenuParams {
  menuId: string
}
export interface DuplicateMenuOutput {
  menu: {
    id: string
    title: string
    checkin: Date
    checkout: Date
    adults: number
    child: number
    restrictions: string[]
    preferences: string
    createdAt: Date
    updatedAt: Date
    meals: Array<{
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
    }>
  }
}

export interface DeleteMenuParams {
  id: string
}