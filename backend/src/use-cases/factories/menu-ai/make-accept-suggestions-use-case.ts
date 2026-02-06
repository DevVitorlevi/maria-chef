import { PrismaDishRepository } from "@/repositories/prisma/prisma-dish-repository"
import { PrismaIngredientRepository } from "@/repositories/prisma/prisma-ingredient-repository"
import { PrismaMealRepository } from "@/repositories/prisma/prisma-meal-repository"
import { PrismaMenuRepository } from "@/repositories/prisma/prisma-menu-repository"
import { AcceptMenuAISuggestionsUseCase } from "@/use-cases/menu-ai/accept-suggestions"

export function makeAcceptMenuAISuggestionsUseCase() {
  const menuRepository = new PrismaMenuRepository()
  const mealRepository = new PrismaMealRepository()
  const dishRepository = new PrismaDishRepository()
  const ingredientRepository = new PrismaIngredientRepository()

  return new AcceptMenuAISuggestionsUseCase(
    menuRepository,
    mealRepository,
    dishRepository,
    ingredientRepository
  )
}