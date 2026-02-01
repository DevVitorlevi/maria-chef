import { PrismaMealRepository } from "@/repositories/prisma/prisma-meal-repository";
import { PrismaMenuRepository } from "@/repositories/prisma/prisma-menu-repository";
import { UpdateMealUseCase } from "@/use-cases/meal/update";

export function makeUpdateMealUseCase() {
  const prismaMenuRepository = new PrismaMenuRepository()
  const prismaMealRepository = new PrismaMealRepository()
  const updateMealUseCase = new UpdateMealUseCase(prismaMealRepository, prismaMenuRepository)

  return updateMealUseCase
}