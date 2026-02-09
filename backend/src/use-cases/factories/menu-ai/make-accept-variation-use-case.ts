import { PrismaDishRepository } from "@/repositories/prisma/prisma-dish-repository"
import { PrismaIngredientRepository } from "@/repositories/prisma/prisma-ingredient-repository"
import { PrismaMealRepository } from "@/repositories/prisma/prisma-meal-repository"
import { PrismaMenuRepository } from "@/repositories/prisma/prisma-menu-repository"
import { AcceptVariationUseCase } from "@/use-cases/menu-ai/accept-variation"

export function makeAcceptVariationUseCase() {
  const menuRepository = new PrismaMenuRepository()
  const mealRepository = new PrismaMealRepository()
  const dishRepository = new PrismaDishRepository()
  const ingredientRepository = new PrismaIngredientRepository()

  return new AcceptVariationUseCase(
    mealRepository,
    menuRepository,
    dishRepository,
    ingredientRepository
  )
}