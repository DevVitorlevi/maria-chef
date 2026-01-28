import { PrismaMenuRepository } from "@/repositories/prisma/prisma-menu-repository";
import { DuplicateMenuUseCase } from "@/use-cases/menu/duplicate";

export function makeDuplicateMenuUseCase() {
  const prismaMenuRepository = new PrismaMenuRepository()
  const duplicateMenuUseCase = new DuplicateMenuUseCase(prismaMenuRepository)

  return duplicateMenuUseCase
}