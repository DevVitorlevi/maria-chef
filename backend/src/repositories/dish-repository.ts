import type { Prato, Prisma } from "@/generated/prisma/client";

export interface DishRepository {
  create(data: Prisma.PratoCreateInput): Promise<Prato>
}