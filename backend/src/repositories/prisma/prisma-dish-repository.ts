import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import type { DishRepository, DishWithIngredients } from "../dish-repository";

export class PrismaDishRepository implements DishRepository {
  async create(
    data: Prisma.PratoCreateInput
  ): Promise<DishWithIngredients> {
    const prato = await prisma.prato.create({
      data,
      include: {
        ingredientes: true,
      },
    });

    return prato;
  }
}
