import { PrismaDishRepository } from "@/repositories/prisma/prisma-dish-repository";
import { FindByIdDishUseCase } from "../dish/findById";

export function makeFindByIdUseCase(){
  const prismaDishRepository = new PrismaDishRepository()
  const findByIdDishUseCase = new FindByIdDishUseCase(prismaDishRepository)

  return findByIdDishUseCase
}
