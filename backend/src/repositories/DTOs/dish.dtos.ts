import type { CategoryOfDish, CategoryOfIngredient } from "@/generated/prisma/enums";
import type { Decimal } from "@prisma/client/runtime/client";
export interface CreateDishInput {
  name: string;
  category: CategoryOfDish;
}
export interface CreateDishOutput {
  dish: {
    id: string
    name: string;
    category: CategoryOfDish;
    createdAt: Date
  }
}
export interface FindAllDishesFiltersInput {
  name?: string | undefined
  category?: CategoryOfDish | undefined
}

export interface FindAllDishesOutput {
  dishes:
  {
    id: string
    name: string;
    category: CategoryOfDish;
    createdAt: Date
  }[]
}
export interface FindByIdDishParams {
  dishId: string
}
export interface FindByIdDishOutput {
  dish: {
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
  }
}
export interface UpdateDishInput {
  name?: string;
  category?: CategoryOfDish;
}
export interface UpdateDishOutput {
  dish: {
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
  }
}
export interface DuplicateDishParams {
  dishId: string
}
export interface DuplicateDishOutput {
  dish: {
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
  }
}

export interface DeleteDishParams {
  id: string
}

