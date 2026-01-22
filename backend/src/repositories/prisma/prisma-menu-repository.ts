import { prisma } from "@/lib/prisma";
import type { CreateMenuInput } from "../DTOs/menu.dtos";
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
}