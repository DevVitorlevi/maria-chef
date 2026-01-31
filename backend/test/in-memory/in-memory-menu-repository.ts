import type { Cardapio, Prato, Refeicao } from "@/generated/prisma/client";
import type { CreateMenuInput, FindAllFiltersParams, FindAllMenusOutput, UpdateMenuInput } from "@/repositories/DTOs/menu.dtos";
import type { MenuRepository } from "@/repositories/menu-repository";
import { ResourceNotFoundError } from "@/utils/errors/resource-not-found-error";
import { randomUUID } from "node:crypto";
import type { InMemoryDishRepository } from "./in-memory-dish-repository";
import type { InMemoryMealRepository } from "./in-memory-meal-repository";

export class InMemoryMenuRepository implements MenuRepository {
  public database: Cardapio[] = []

  constructor(
    private mealRepository?: InMemoryMealRepository,
    private dishRepository?: InMemoryDishRepository
  ) { }

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
    const menu = this.database.find(menu => menu.id === menuId)

    if (!menu) {
      return null
    }

    const refeicoes = this.mealRepository
      ? await Promise.all(
        this.mealRepository.database
          .filter(meal => meal.cardapioId === menuId)
          .map(async meal => {
            const pratoIds = this.mealRepository!.pratosRelation.get(meal.id) || []
            const pratos: Prato[] = []

            if (pratoIds.length > 0 && this.mealRepository!.dishRepository) {
              for (const pratoId of pratoIds) {
                const prato = await this.mealRepository!.dishRepository.findById(pratoId)
                if (prato) {
                  pratos.push(prato)
                }
              }
            }

            return {
              ...meal,
              pratos
            }
          })
      )
      : []

    return {
      ...menu,
      refeicoes,
    }
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
  async update(id: string, data: UpdateMenuInput) {
    const menu = this.database.find(menu => menu.id === id)

    if (!menu) {
      throw new Error('Cardápio não encontrado')
    }

    Object.assign(menu, {
      ...(data.title !== undefined && { titulo: data.title }),
      ...(data.checkIn !== undefined && { checkin: new Date(data.checkIn) }),
      ...(data.checkOut !== undefined && { checkout: new Date(data.checkOut) }),
      ...(data.adults !== undefined && { adultos: data.adults }),
      ...(data.kids !== undefined && { criancas: data.kids }),
      ...(data.restricoes !== undefined && { restricoes: data.restricoes }),
      ...(data.preferencias !== undefined && { preferencias: data.preferencias }),
      updatedAt: new Date()
    })

    const refeicoes = this.mealRepository
      ? this.mealRepository.database.filter(
        meal => meal.cardapioId === id
      )
      : []

    return {
      menu: {
        ...menu,
        refeicoes
      }
    }
  }

  async duplicate(menuId: string) {
    const currentMenu = await this.findById(menuId)

    if (!currentMenu) {
      throw new Error('Cardápio não encontrado')
    }

    const duplicateTitle = `${currentMenu.titulo} (cópia)`

    const duplicateMenu: Cardapio = {
      id: randomUUID(),
      titulo: duplicateTitle,
      checkin: currentMenu.checkin,
      checkout: currentMenu.checkout,
      adultos: currentMenu.adultos,
      criancas: currentMenu.criancas,
      preferencias: currentMenu.preferencias,
      restricoes: currentMenu.restricoes,
      geradoPorIA: currentMenu.geradoPorIA,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.database.push(duplicateMenu)

    const duplicatedMeals = []

    if (this.mealRepository && currentMenu.refeicoes) {
      for (const meal of currentMenu.refeicoes) {
        const newMealId = randomUUID()

        const duplicatedMeal: Refeicao = {
          id: newMealId,
          cardapioId: duplicateMenu.id,
          data: meal.data,
          tipo: meal.tipo,
          createdAt: new Date()
        }

        this.mealRepository.database.push(duplicatedMeal)

        const pratoIds = this.mealRepository.pratosRelation.get(meal.id)
        if (pratoIds && pratoIds.length > 0) {
          this.mealRepository.pratosRelation.set(newMealId, [...pratoIds])
        }

        const pratos: Prato[] = []
        if (pratoIds && this.mealRepository.dishRepository) {
          for (const pratoId of pratoIds) {
            const prato = await this.mealRepository.dishRepository.findById(pratoId)
            if (prato) {
              pratos.push(prato)
            }
          }
        }

        duplicatedMeals.push({
          ...duplicatedMeal,
          pratos
        })
      }
    }

    return {
      cardapio: {
        ...duplicateMenu,
        refeicoes: duplicatedMeals
      }
    }
  }

  async delete(id: string) {
    const menuIndex = this.database.findIndex(
      menu => menu.id === id
    )

    if (menuIndex === -1) {
      throw new ResourceNotFoundError()
    }

    this.database.splice(menuIndex, 1)
  }
}