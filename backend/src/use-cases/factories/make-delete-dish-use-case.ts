import { PrismaDishRepository } from "@/repositories/prisma/prisma-dish-repository";
import { DeleteDishUseCase } from "../dish/delete";

export function makeDeleteDishUseCase() {
  const prismaDishRepository = new PrismaDishRepository()
  const deleteDishUseCase = new DeleteDishUseCase(prismaDishRepository)

  return deleteDishUseCase
}