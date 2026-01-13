import type { CategoriaPrato, Prato, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { DishRepository, DishWithIngredients } from "../dish-repository";

interface FindAllByFilters {
  nome?: string,
  categoria?: CategoriaPrato
}

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

  async findAll(filters?: FindAllByFilters): Promise<Prato[]> {
    const pratos = await prisma.prato.findMany({
      where: {
        ...(filters?.nome && {
          nome: {
            contains: filters.nome,
            mode: 'insensitive'
          }
        }),
        ...(filters?.categoria && {
          categoria: filters.categoria
        })
      }
    })
    return pratos
  }
}