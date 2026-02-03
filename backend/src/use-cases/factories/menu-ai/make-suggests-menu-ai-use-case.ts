import { PrismaMenuAIRepository } from "@/repositories/prisma/prisma-menu-ai-repository"
import { PrismaMenuRepository } from "@/repositories/prisma/prisma-menu-repository"
import { MenuAiSuggestsUseCase } from "@/use-cases/menu-ai/suggests"

export function makeMenuAISuggestsUseCase() {
  const menuRepository = new PrismaMenuRepository()
  const menuAIRepository = new PrismaMenuAIRepository()
  const menuAiSuggestsUseCase = new MenuAiSuggestsUseCase(menuRepository, menuAIRepository)
  return menuAiSuggestsUseCase
}