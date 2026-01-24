import type { Cardapio } from "@/generated/prisma/client";
import type { CreateMenuInput, FindAllFiltersParams, FindAllMenusOutput } from "@/repositories/DTOs/menu.dtos";
import type { MenuRepository } from "@/repositories/menu-repository";
import { randomUUID } from "node:crypto";

export class InMemoryMenuRepository implements MenuRepository {
  public database: Cardapio[] = []
  async create(data: CreateMenuInput) {
    const menu: Cardapio = {
      id: randomUUID(),
      titulo: data.title,
      checkin: new Date(data.checkIn),
      checkout: new Date(data.checkOut),
      adultos: data.adults,
      criancas: data.kids ?? 0,
      restricoes: data.restricoes ?? [],
      preferencias: data.preferencias ?? null,
      geradoPorIA: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.database.push(menu)

    return menu
  }

  async findById(menuId: string) {
    const menu = await this.database.find((menu) => menu.id === menuId)

    if (!menu) {
      return null
    }

    return menu
  }

  async findAll(params?: FindAllFiltersParams): Promise<FindAllMenusOutput> {
    let allMenus = this.database

    if (params?.titulo) {
      const tituloLowerCase = params.titulo.toLowerCase()
      allMenus = allMenus.filter(menu =>
        menu.titulo.toLowerCase().includes(tituloLowerCase)
      )
    }

    if (params?.data) {
      allMenus = allMenus.filter(menu => {
        const dataFiltro = new Date(params.data!)
        const checkin = new Date(menu.checkin)
        const checkout = new Date(menu.checkout)

        return dataFiltro >= checkin && dataFiltro <= checkout
      })
    }

    const total = allMenus.length
    const page = params?.page || 1
    const limit = params?.limit || 20
    const limitCapped = Math.min(limit, 100)

    const startIndex = (page - 1) * limitCapped
    const endIndex = startIndex + limitCapped

    const paginatedMenus = allMenus.slice(startIndex, endIndex)

    const totalPages = Math.ceil(total / limitCapped)

    return {
      menus: paginatedMenus,
      total,
      page,
      totalPages
    }
  }
}