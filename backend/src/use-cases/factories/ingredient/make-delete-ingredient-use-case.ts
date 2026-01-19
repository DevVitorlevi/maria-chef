import { PrismaDishRepository } from "@/repositories/prisma/prisma-dish-repository";
import { PrismaIngredientRepository } from "@/repositories/prisma/prisma-ingredient-repository";
import { DeleteIngredientUseCase } from "../../ingredient/delete";

export function makeDeleteIngredientUseCase() {
  const prismaIngredientRepository = new PrismaIngredientRepository()
  const prismaDishRepository = new PrismaDishRepository()
  const deleteIngredientUseCase = new DeleteIngredientUseCase(prismaIngredientRepository, prismaDishRepository)

  return deleteIngredientUseCase
}