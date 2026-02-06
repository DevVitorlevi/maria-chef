import { prisma } from "@/lib/prisma"
import { ResourceNotFoundError } from "@/utils/errors/resource-not-found-error"
import type { CreateMealInput, DeleteMealsParams, FindByIdMealParams, UpdateMealInput, UpdateMealParams } from "../DTOs/meal.dtos"
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

  async findById(params: FindByIdMealParams) {
    const meal = await prisma.refeicao.findFirst({
      where: {
        id: params.id,
        cardapioId: params.menuId,
      },
      include: {
        pratos: {
          include: {
            ingredientes: true,
          },
        },
      },
    })

    if (!meal) {
      throw new ResourceNotFoundError()
    }

    return {
      meal: {
        id: meal.id,
        cardapioId: meal.cardapioId,
        data: meal.data,
        tipo: meal.tipo,
        pratos: meal.pratos.map(dish => ({
          id: dish.id,
          nome: dish.nome,
          categoria: dish.categoria,
          createdAt: dish.createdAt,
          ingredientes: dish.ingredientes.map(ing => ({
            id: ing.id,
            pratoId: ing.pratoId,
            nome: ing.nome,
            quantidade: ing.quantidade,
            unidade: ing.unidade,
            categoria: ing.categoria,
          })),
        })),
        createdAt: meal.createdAt,
      },
    }

  }
}
