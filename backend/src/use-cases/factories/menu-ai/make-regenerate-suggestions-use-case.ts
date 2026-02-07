import { PrismaMenuAIRepository } from "@/repositories/prisma/prisma-menu-ai-repository"
import { PrismaMenuRepository } from "@/repositories/prisma/prisma-menu-repository"
import { RegenarateSuggestionsUseCase } from "@/use-cases/menu-ai/regenerate-suggestions"

export function makeRegenarateSuggestionsUseCase() {
  const menuRepository = new PrismaMenuRepository()
  const menuAIRepository = new PrismaMenuAIRepository()

  const regenarateSuggestionsUseCase = new RegenarateSuggestionsUseCase(
    menuAIRepository,
    menuRepository
  )

  return regenarateSuggestionsUseCase
}