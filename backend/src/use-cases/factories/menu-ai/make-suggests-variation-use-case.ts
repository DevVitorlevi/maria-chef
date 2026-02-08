import { PrismaMenuAIRepository } from "@/repositories/prisma/prisma-menu-ai-repository"
import { PrismaMenuRepository } from "@/repositories/prisma/prisma-menu-repository"
import { SuggestsVariationUseCase } from "@/use-cases/menu-ai/suggests-variation"

export function makeSuggestsVariationUseCase() {
  const menuRepository = new PrismaMenuRepository()
  const menuAIRepository = new PrismaMenuAIRepository()

  const suggestsVariationUseCase = new SuggestsVariationUseCase(
    menuAIRepository,
    menuRepository
  )

  return suggestsVariationUseCase
}