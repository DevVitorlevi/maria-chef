import type { CategoriaPrato, Prato } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { DishRepository } from "../dish-repository";
import type { CreateDishInput, DuplicateDishInput, FindAllDishesFiltersInput, FindByIdDishParams, UpdateDishInput } from "../DTOs/dish.dtos";
export class PrismaDishRepository implements DishRepository {
  async create(
    data: CreateDishInput
  ) {
    const prato = await prisma.prato.create({
      data,
    });
    return prato;
  }

  async findAll(filters?: FindAllDishesFiltersInput): Promise<Prato[]> {
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

  async findById(
    { dishId }: FindByIdDishParams
  ) {
    const dish = await prisma.prato.findUnique({
      where: {
        id: dishId
      },
      include: {
        ingredientes: true
      }
    })

    return dish
  }

  async update(
    dishId: string,
    data: UpdateDishInput
  ) {
    return prisma.prato.update({
      where: { id: dishId },
      data,
    });
  }
  async duplicate(
    dishId: string,
    data?: DuplicateDishInput
  ) {
    const pratoOriginal = await prisma.prato.findUnique({
      where: { id: dishId },
      include: {
        ingredientes: true,
      },
    });

    if (!pratoOriginal) {
      throw new Error("Prato não encontrado");
    }

    const nomeDuplicado = `${pratoOriginal.nome} (cópia)`;

    const nomeAtualizado = data?.nome
      ? typeof data.nome === 'object' && 'set' in data.nome
        ? data.nome
        : data.nome
      : undefined;

    const categoriaAtualizada = data?.categoria
      ? typeof data.categoria === 'object' && 'set' in data.categoria
        ? data.categoria
        : data.categoria
      : undefined;

    const pratoDuplicado = await prisma.prato.create({
      data: {
        nome: (nomeAtualizado as string) ?? nomeDuplicado,
        categoria: (categoriaAtualizada as CategoriaPrato) ?? pratoOriginal.categoria,
        ingredientes: {
          create: pratoOriginal.ingredientes.map((ingrediente) => ({
            nome: ingrediente.nome,
            quantidade: ingrediente.quantidade,
            unidade: ingrediente.unidade,
            categoria: ingrediente.categoria,
          })),
        },
      },
      include: {
        ingredientes: true,
      },
    });

    return pratoDuplicado;
  }

  async delete(id: string) {
    await prisma.prato.delete({
      where: {
        id
      }
    })
  }
}