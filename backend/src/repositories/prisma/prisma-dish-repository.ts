import type { CategoriaPrato, Prato, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { DishRepository, DishWithIngredients } from "../dish-repository";
import type { CreateDishInput, FindAllDishesFiltersInput } from "../DTOs/dish.dtos";
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

  async findById(id: string): Promise<DishWithIngredients | null> {
    const prato = await prisma.prato.findUnique({
      where: {
        id,
      },
      include: {
        ingredientes: true
      }
    })

    return prato
  }

  async update(
    id: string,
    data: Prisma.PratoUpdateInput
  ): Promise<DishWithIngredients> {
    return prisma.prato.update({
      where: { id },
      data,
      include: {
        ingredientes: true,
      },
    });
  }
  async duplicate(
    id: string,
    data?: Prisma.PratoUpdateInput
  ): Promise<DishWithIngredients> {
    const pratoOriginal = await prisma.prato.findUnique({
      where: { id },
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
        ? data.nome.set
        : data.nome
      : undefined;

    const categoriaAtualizada = data?.categoria
      ? typeof data.categoria === 'object' && 'set' in data.categoria
        ? data.categoria.set
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