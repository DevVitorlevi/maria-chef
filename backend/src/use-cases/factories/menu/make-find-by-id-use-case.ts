import { PrismaMenuRepository } from "@/repositories/prisma/prisma-menu-repository";
import { FindByIdMenuUseCase } from "@/use-cases/menu/findById";

export function makeFindByIdMenuUseCase() {
  const prismaMenuRepository = new PrismaMenuRepository()
  const findByIdMenuUseCase = new FindByIdMenuUseCase(prismaMenuRepository)

  return findByIdMenuUseCase
}