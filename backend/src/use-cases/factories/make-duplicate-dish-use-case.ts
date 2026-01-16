import { PrismaDishRepository } from "@/repositories/prisma/prisma-dish-repository";
import { DuplicateDishUseCase } from "../dish/duplicate";

export function makeDuplicateDishUseCase() {
  const prismaDishRepository = new PrismaDishRepository()
  const duplicateDishUseCase = new DuplicateDishUseCase(prismaDishRepository)
  return duplicateDishUseCase
}