import { PrismaDishRepository } from "@/repositories/prisma/prisma-dish-repository";
import { UpdateDishUseCase } from "../dish/update";

export function makeUpdateDishUseCase() {
  const prismaDishRepository = new PrismaDishRepository()
  const updateDishUseCase = new UpdateDishUseCase(prismaDishRepository)

  return updateDishUseCase
}