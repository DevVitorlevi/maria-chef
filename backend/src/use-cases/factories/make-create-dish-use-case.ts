import { PrismaDishRepository } from "@/repositories/prisma/prisma-dish-repository";
import { CreateDishUseCase } from "../dish/create";

export function makeCreateDishUseCase() {
  const prismaDishRepository = new PrismaDishRepository()
  const createDishUseCase = new CreateDishUseCase(prismaDishRepository)

  return createDishUseCase
}