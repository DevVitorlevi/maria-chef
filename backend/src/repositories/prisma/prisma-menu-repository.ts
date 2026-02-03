import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { ResourceNotFoundError } from "@/utils/errors/resource-not-found-error";
import type { CreateMenuInput, FindAllFiltersParams, UpdateMenuInput } from "../DTOs/menu.dtos";
import type { MenuRepository } from "../menu-repository";

export class PrismaMenuRepository implements MenuRepository {
  async create(data: CreateMenuInput) {
    const menu = await prisma.cardapio.create({
      data: {
        titulo: data.title,
        checkin: data.checkIn,
        checkout: data.checkOut,
        adultos: data.adults,
        criancas: data.kids ?? 0,
        restricoes: data.restricoes ?? [],
        preferencias: data.preferencias ?? null,
        geradoPorIA: false,
      }
    })
    return menu
  }

  async findById(menuId: string) {
    return prisma.cardapio.findUnique({
      where: { id: menuId },
      include: {
        refeicoes: {
          include: {
            pratos: true
          }
        }
      }
    })
  }

  async findAll(params?: FindAllFiltersParams) {
    const page = params?.page || 1
    const limit = params?.limit || 20
    const limitCapped = Math.min(limit, 100)
    const skip = (page - 1) * limitCapped

    const where: Prisma.CardapioWhereInput = {}

    if (params?.titulo) {
      where.titulo = {
        contains: params.titulo,
        mode: 'insensitive'
      }
    }
    if (params?.data) {
      const dataFiltro = new Date(params.data)
      where.AND = [
        { checkin: { lte: dataFiltro } },
        { checkout: { gte: dataFiltro } }
      ]
    }

    const [menus, total] = await Promise.all([
      prisma.cardapio.findMany({
        where,
        skip,
        take: limitCapped
      }),
      prisma.cardapio.count({ where })
    ])

    const totalPages = Math.ceil(total / limitCapped)

    return {
      menus,
      total,
      page,
      totalPages
    }
  }

  async update(id: string, data: UpdateMenuInput) {
    const menu = await prisma.cardapio.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { titulo: data.title }),
        ...(data.checkIn !== undefined && { checkin: data.checkIn }),
        ...(data.checkOut !== undefined && { checkout: data.checkOut }),
        ...(data.adults !== undefined && { adultos: data.adults }),
        ...(data.kids !== undefined && { criancas: data.kids }),
        ...(data.restricoes !== undefined && { restricoes: data.restricoes }),
        ...(data.preferencias !== undefined && { preferencias: data.preferencias }),
      },
      include: {
        refeicoes: true
      }
    })

    return { menu }
  }

  async duplicate(menuId: string) {
    return prisma.$transaction(async tx => {
      const currentMenu = await tx.cardapio.findUnique({
        where: { id: menuId },
        include: {
          refeicoes: {
            include: {
              pratos: true
            }
          }
        }
      })

      if (!currentMenu) {
        throw new ResourceNotFoundError()
      }

      const duplicatedMenu = await tx.cardapio.create({
        data: {
          titulo: `${currentMenu.titulo} (cópia)`,
          checkin: currentMenu.checkin,
          checkout: currentMenu.checkout,
          adultos: currentMenu.adultos,
          criancas: currentMenu.criancas,
          preferencias: currentMenu.preferencias,
          restricoes: currentMenu.restricoes,
          geradoPorIA: currentMenu.geradoPorIA,
        }
      })

      for (const refeicao of currentMenu.refeicoes) {
        await tx.refeicao.create({
          data: {
            cardapioId: duplicatedMenu.id,
            data: refeicao.data,
            tipo: refeicao.tipo,
            pratos: {
              connect: refeicao.pratos.map(prato => ({ id: prato.id }))
            }
          }
        })
      }

      const duplicatedMenuWithRelations = await tx.cardapio.findUnique({
        where: { id: duplicatedMenu.id },
        include: {
          refeicoes: {
            include: {
              pratos: true
            }
          }
        }
      })

      if (!duplicatedMenuWithRelations) {
        throw new Error('Erro ao recuperar cardápio duplicado')
      }

      return {
        cardapio: duplicatedMenuWithRelations
      }
    })
  }

  async delete(id: string) {
    return await prisma.cardapio.delete({
      where: {
        id
      }
    })
  }
}