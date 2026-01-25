import { prisma } from "@/lib/prisma"
import type { CreateMealInput, DeleteMealsParams } from "../DTOs/meal.dtos"
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
}
