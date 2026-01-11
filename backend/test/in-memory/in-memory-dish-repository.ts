import { randomUUID } from "node:crypto";
import type { Prato, Prisma } from "../../src/generated/prisma/client";
import type { DishRepository } from "../../src/repositories/dish-repository";
export class InMemoryDishRepository implements DishRepository {
  public database: Prato[] = []
  async create(data: Prisma.PratoCreateInput) {
    const dish: Prato = {
      id: data.id ?? randomUUID(),
      nome: data.nome,
      categoria: data.categoria,
      createdAt: new Date(),
    }

    this.database.push(dish)

    return dish
  }
} 