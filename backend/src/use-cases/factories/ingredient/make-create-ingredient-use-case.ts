import { PrismaDishRepository } from "@/repositories/prisma/prisma-dish-repository";
import { PrismaIngredientRepository } from "@/repositories/prisma/prisma-ingredient-repository";
import { CreateIngredientUseCase } from "../../ingredient/create";

export function makeCreateIngredientUseCase() {
  const prismaIngredientRepository = new PrismaIngredientRepository()
  const prismaDishRepository = new PrismaDishRepository()
  const createIngredientUseCase = new CreateIngredientUseCase(prismaIngredientRepository, prismaDishRepository)

  return createIngredientUseCase
}