import { PrismaMenuRepository } from "@/repositories/prisma/prisma-menu-repository";
import { FindAllMenusUseCase } from "@/use-cases/menu/findAll";

export function makeFindAllMenusUseCase() {
  const prismaMenuRepository = new PrismaMenuRepository()
  const findAllMenusMenuUseCase = new FindAllMenusUseCase(prismaMenuRepository)

  return findAllMenusMenuUseCase

}