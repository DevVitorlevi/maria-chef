import { PrismaMenuRepository } from "@/repositories/prisma/prisma-menu-repository";
import { CreateMenuUseCase } from "@/use-cases/menu/create";

export function makeCreateMenuUseCase() {
  const prismaMenuRepository = new PrismaMenuRepository()
  const createMenuUseCase = new CreateMenuUseCase(prismaMenuRepository)

  return createMenuUseCase
}