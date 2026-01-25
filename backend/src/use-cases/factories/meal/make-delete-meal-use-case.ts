import { PrismaMealRepository } from "@/repositories/prisma/prisma-meal-repository";
import { PrismaMenuRepository } from "@/repositories/prisma/prisma-menu-repository";
import { DeleteMealUseCase } from "@/use-cases/meal/delete";

export function makeDeleteMealUseCase() {
  const prismaMenuRepository = new PrismaMenuRepository()
  const prismaMealRepository = new PrismaMealRepository()
  const deleteMealUseCase = new DeleteMealUseCase(prismaMealRepository, prismaMenuRepository)

  return deleteMealUseCase
}