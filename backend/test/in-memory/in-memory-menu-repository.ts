import type { Cardapio } from "@/generated/prisma/client";
import type { CreateMenuInput } from "@/repositories/DTOs/menu.dtos";
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

}