import { PrismaDishRepository } from "@/repositories/prisma/prisma-dish-repository";
import { FindAllDishUseCase } from "../dish/findAll";

export function makeFindAllDishesUseCase() {
  const prismaDishRepository = new PrismaDishRepository()
  const findAllDishesUseCase = new FindAllDishUseCase(prismaDishRepository)

  return findAllDishesUseCase
}