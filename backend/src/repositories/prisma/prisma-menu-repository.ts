import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { ResourceNotFoundError } from "@/utils/errors/resource-not-found-error";
import type { CreateMenuInput, FindAllFiltersParams, UpdateMenuInput } from "../DTOs/menu.dtos";
import type { MenuRepository } from "../menu-repository";

export class PrismaMenuRepository implements MenuRepository {
  async create(data: CreateMenuInput) {
    const menu = await prisma.menu.create({
      data: {
        title: data.title,
        checkin: data.checkIn,
        checkout: data.checkOut,
        adults: data.adults,
        child: data.child ?? 0,
        restrictions: data.restrictions ?? [],
        preferences: data.preferences ?? null,
      }
    })

    return {
      menu: {
        ...menu,
        child: menu.child ?? 0,
        preferences: menu.preferences ?? ""
      }
    }
  }

  async findById(menuId: string) {
    const menu = await prisma.menu.findUnique({
      where: { id: menuId },
      include: {
        meals: {
          include: {
            dishes: {
              include: {
                ingredients: true,
              }
            },
          },
        },
      },
    });

    if (!menu) return null;

    return {
      menu: {
        id: menu.id,
        title: menu.title,
        checkin: menu.checkin,
        checkout: menu.checkout,
        adults: menu.adults,
        child: menu.child ?? 0,
        restrictions: menu.restrictions ?? [],
        preferences: menu.preferences ?? "",
        createdAt: menu.createdAt,
        updatedAt: menu.updatedAt,
        meals: menu.meals.map(meal => ({
          id: meal.id,
          menuId: meal.menuId,
          date: meal.date,
          type: meal.type,
          createdAt: meal.createdAt,
          dishes: meal.dishes.map(dish => ({
            id: dish.id,
            name: dish.name,
            category: dish.category,
            createdAt: dish.createdAt,
            ingredients: dish.ingredients
          })),
        })),
      }
    };
  }


  async findAll(params?: FindAllFiltersParams) {
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const limitCapped = Math.min(limit, 100);
    const skip = (page - 1) * limitCapped;

    const where: Prisma.MenuWhereInput = {};

    if (params?.title) {
      where.title = {
        contains: params.title,
        mode: 'insensitive'
      };
    }

    if (params?.date) {
      const filterDate = new Date(params.date);
      where.AND = [
        { checkin: { lte: filterDate } },
        { checkout: { gte: filterDate } }
      ];
    }

    const [menusRaw, total] = await Promise.all([
      prisma.menu.findMany({
        where,
        skip,
        take: limitCapped,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.menu.count({ where })
    ]);

    const menus = menusRaw.map(menu => ({
      ...menu,
      child: menu.child ?? 0,
      preferences: menu.preferences ?? ""
    }));

    const totalPages = Math.ceil(total / limitCapped);

    return {
      menus,
      total,
      page,
      totalPages
    };
  }

  async update(id: string, data: UpdateMenuInput) {
    const menu = await prisma.menu.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.checkIn !== undefined && { checkin: data.checkIn }),
        ...(data.checkOut !== undefined && { checkout: data.checkOut }),
        ...(data.adults !== undefined && { adults: data.adults }),
        ...(data.child !== undefined && { child: data.child }),
        ...(data.restrictions !== undefined && { restrictions: data.restrictions }),
        ...(data.preferences !== undefined && { preferences: data.preferences }),
      },
      include: {
        meals: {
          include: {
            dishes: {
              include: { ingredients: true }
            }
          }
        }
      }
    });

    const menuNormalized = {
      ...menu,
      child: menu.child ?? 0,
      preferences: menu.preferences ?? "",
      meals: menu.meals.map(meal => ({
        ...meal,
        dishes: meal.dishes.map(dish => ({
          id: dish.id,
          name: dish.name,
          category: dish.category,
          createdAt: dish.createdAt,
          ingredients: dish.ingredients
        }))
      }))
    };

    return { menu: menuNormalized };
  }

  async duplicate(menuId: string) {
    return prisma.$transaction(async tx => {
      const currentMenu = await tx.menu.findUnique({
        where: { id: menuId },
        include: {
          meals: {
            include: { dishes: true }
          }
        }
      });

      if (!currentMenu) throw new ResourceNotFoundError();

      const duplicatedMenu = await tx.menu.create({
        data: {
          title: `${currentMenu.title} (cópia)`,
          checkin: currentMenu.checkin,
          checkout: currentMenu.checkout,
          adults: currentMenu.adults,
          child: currentMenu.child ?? 0,
          preferences: currentMenu.preferences,
          restrictions: currentMenu.restrictions,
        }
      });

      for (const meal of currentMenu.meals) {
        await tx.meal.create({
          data: {
            menuId: duplicatedMenu.id,
            date: meal.date,
            type: meal.type,
            dishes: {
              connect: meal.dishes.map(p => ({ id: p.id }))
            }
          }
        });
      }

      const duplicatedMenuWithRelations = await tx.menu.findUnique({
        where: { id: duplicatedMenu.id },
        include: {
          meals: {
            include: {
              dishes: {
                include: { ingredients: true }
              }
            }
          }
        }
      });

      if (!duplicatedMenuWithRelations) throw new Error("Erro ao recuperar cardápio duplicado");
      const normalized = {
        ...duplicatedMenuWithRelations,
        child: duplicatedMenuWithRelations.child ?? 0,
        preferences: duplicatedMenuWithRelations.preferences ?? "",
        meals: duplicatedMenuWithRelations.meals.map(meal => ({
          ...meal,
          dishes: meal.dishes.map(dish => ({
            id: dish.id,
            name: dish.name,
            category: dish.category,
            createdAt: dish.createdAt,
            ingredients: dish.ingredients
          }))
        }))
      };

      return { menu: normalized }
    });
  }

  async delete(id: string) {
    return await prisma.menu.delete({
      where: {
        id
      }
    })
  }
}