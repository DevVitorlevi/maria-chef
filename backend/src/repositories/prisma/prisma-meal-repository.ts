import { prisma } from "@/lib/prisma"
import type {
  CreateMealInput,
  DeleteMealsParams,
  FindByIdMealParams,
  UpdateMealInput,
  UpdateMealParams
} from "../DTOs/meal.dtos"
import type { MealRepository } from "../meal-repository"

export class PrismaMealRepository implements MealRepository {
  async create(data: CreateMealInput) {
    const meal = await prisma.meal.create({
      data: {
        menuId: data.menuId,
        date: data.date,
        type: data.type,
        dishes: {
          connect: data.dishes.map((dishId) => ({ id: dishId })),
        },
      },
      include: {
        dishes: {
          include: {
            ingredients: true,
          },
        },
      },
    })

    return { meal }
  }

  async delete(params: DeleteMealsParams) {
    return prisma.meal.delete({
      where: {
        id: params.id,
        menuId: params.menuId,
      },
    })
  }

  async update(params: UpdateMealParams, data?: UpdateMealInput) {
    const meal = await prisma.meal.update({
      where: {
        id: params.mealId,
        menuId: params.menuId,
      },
      data: {
        ...(data?.date !== undefined && { data: data.date }),
        ...(data?.type !== undefined && { tipo: data.type }),
        ...(data?.dishes !== undefined && {
          dishes: {
            set: data.dishes.map((dishId) => ({ id: dishId })),
          },
        }),
      },
      include: {
        dishes: {
          select: {
            id: true,
            name: true,
            category: true,
            createdAt: true,
          },
        },
      },
    })

    return {
      meal: {
        id: meal.id,
        menuId: meal.menuId,
        date: meal.date,
        type: meal.type,
        dishes: meal.dishes,
        createdAt: meal.createdAt,
      },
    }
  }

  async findById(params: FindByIdMealParams) {
    const meal = await prisma.meal.findFirst({
      where: {
        id: params.id,
        menuId: params.menuId,
      },
      include: {
        dishes: {
          include: {
            ingredients: true,
          },
        },
      },
    })

    if (!meal) return null

    return {
      meal: {
        id: meal.id,
        menuId: meal.menuId,
        date: meal.date,
        type: meal.type,
        dishes: meal.dishes.map((dish) => ({
          id: dish.id,
          name: dish.name,
          category: dish.category,
          createdAt: dish.createdAt,
          ingredients: dish.ingredients.map((ing) => ({
            id: ing.id,
            dishId: ing.dishId,
            name: ing.name,
            quantify: ing.quantify,
            unit: ing.unit,
            category: ing.category,
          })),
        })),
        createdAt: meal.createdAt,
      },
    }
  }
}
