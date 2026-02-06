import { PrismaMealRepository } from "@/repositories/prisma/prisma-meal-repository";
import { PrismaMenuRepository } from "@/repositories/prisma/prisma-menu-repository";
import { FindByIdMealUseCase } from "@/use-cases/meal/findById";

export function makeFindByIdMealUseCase() {
  const prismaMenuRepository = new PrismaMenuRepository()
  const prismaMealRepository = new PrismaMealRepository()
  const findByIdMealUseCase = new FindByIdMealUseCase(prismaMealRepository, prismaMenuRepository)

  return findByIdMealUseCase
}