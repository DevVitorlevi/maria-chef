import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { CreateMenuInput, FindAllFiltersParams } from "../DTOs/menu.dtos";
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
    const menu = await prisma.cardapio.findUnique({
      where: {
        id: menuId
      }
    })

    return menu
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

}