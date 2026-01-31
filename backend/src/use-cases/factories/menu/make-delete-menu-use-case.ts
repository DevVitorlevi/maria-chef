import { PrismaMenuRepository } from "@/repositories/prisma/prisma-menu-repository";
import { DeleteMenuUseCase } from "@/use-cases/menu/delete";

export function makeDeleteMenuUseCase() {
  const prismaMenuRepository = new PrismaMenuRepository()
  const deleteMenuUseCase = new DeleteMenuUseCase(prismaMenuRepository)

  return deleteMenuUseCase
}