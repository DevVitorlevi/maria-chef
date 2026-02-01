import { prisma } from "@/lib/prisma"
import type { CreateMealInput, DeleteMealsParams, UpdateMealInput, UpdateMealParams } from "../DTOs/meal.dtos"
import type { MealRepository } from "../meal-repository"

export class PrismaMealRepository implements MealRepository {
  async create(data: CreateMealInput) {
    const meal = await prisma.refeicao.create({
      data: {
        cardapioId: data.menuId,
        data: data.date,
        tipo: data.type,
        pratos: {
          connect: data.dishes.map((dishId) => ({
            id: dishId,
          })),
        },
      },
      include: {
        pratos: true,
      },
    })

    return meal
  }

  async delete(params: DeleteMealsParams) {
    return await prisma.refeicao.delete({
      where: {
        id: params.id,
        cardapioId: params.menuId
      }
    })

  }

  async update(params: UpdateMealParams, data?: UpdateMealInput) {
    const meal = await prisma.refeicao.update({
      where: {
        id: params.mealId,
        cardapioId: params.menuId
      },
      data: {
        ...(data?.date !== undefined && { data: data.date }),
        ...(data?.type !== undefined && { tipo: data.type }),
        ...(data?.dishes !== undefined && {
          pratos: {
            set: data.dishes.map(dishId => ({ id: dishId }))
          }
        })
      },
      include: {
        pratos: {
          select: {
            id: true,
            nome: true,
            categoria: true,
            createdAt: true
          }
        }
      }
    })

    return {
      meal: {
        id: meal.id,
        cardapioId: meal.cardapioId,
        data: meal.data,
        tipo: meal.tipo,
        pratos: meal.pratos,
        createdAt: meal.createdAt
      }
    }
  }
}
