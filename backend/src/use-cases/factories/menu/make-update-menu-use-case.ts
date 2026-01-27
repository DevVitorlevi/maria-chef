import { PrismaMenuRepository } from "@/repositories/prisma/prisma-menu-repository";
import { UpdateMenuUseCase } from "@/use-cases/menu/update";

export function makeUpdateMenuUseCase() {
  const prismaMenuRepository = new PrismaMenuRepository()
  const updateMenuUseCase = new UpdateMenuUseCase(prismaMenuRepository)

  return updateMenuUseCase
}