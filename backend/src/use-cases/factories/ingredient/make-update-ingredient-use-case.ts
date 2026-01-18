import { PrismaDishRepository } from "@/repositories/prisma/prisma-dish-repository";
import { PrismaIngredientRepository } from "@/repositories/prisma/prisma-ingredient-repository";
import { UpdateIngredientUseCase } from "../../ingredient/update";

export function makeUpdateIngredientUseCase() {
  const prismaIngredientRepository = new PrismaIngredientRepository()
  const prismaDishRepository = new PrismaDishRepository()
  const updateIngredientUseCase = new UpdateIngredientUseCase(prismaIngredientRepository, prismaDishRepository)

  return updateIngredientUseCase
}