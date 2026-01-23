import { PrismaMealRepository } from "@/repositories/prisma/prisma-meal-repository";
import { PrismaMenuRepository } from "@/repositories/prisma/prisma-menu-repository";
import { CreateMealUseCase } from "@/use-cases/meal/create";

export function makeCreateMealUseCase() {
  const prismaMenuRepository = new PrismaMenuRepository()
  const prismaMealRepository = new PrismaMealRepository()
  const createMealUseCase = new CreateMealUseCase(prismaMealRepository, prismaMenuRepository)

  return createMealUseCase
}