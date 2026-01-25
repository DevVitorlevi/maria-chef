import type { Prato, Refeicao } from "@/generated/prisma/client";
import type { CreateMealInput, DeleteMealsParams } from "@/repositories/DTOs/meal.dtos";
import type { MealRepository } from "@/repositories/meal-repository";
import { ResourceNotFoundError } from "@/utils/errors/resource-not-found-error";
import { randomUUID } from "node:crypto";

type RefeicaoWithPratos = Refeicao & {
  pratos: Prato[]
}

export class InMemoryMealRepository implements MealRepository {
  public database: Refeicao[] = []
  public pratosRelation: Map<string, string[]> = new Map()

  constructor(public dishRepository?: any) { }

  async create(data: CreateMealInput): Promise<RefeicaoWithPratos> {
    const meal: Refeicao = {
      id: randomUUID(),
      cardapioId: data.menuId,
      data: new Date(data.date),
      tipo: data.type,
      createdAt: new Date()
    }

    this.database.push(meal)

    if (data.dishes && data.dishes.length > 0) {
      this.pratosRelation.set(meal.id, data.dishes)
    }

    const pratos: Prato[] = []
    if (data.dishes && this.dishRepository) {
      for (const dishId of data.dishes) {
        const dish = await this.dishRepository.findById(dishId)
        if (dish) {
          pratos.push(dish)
        }
      }
    } else if (data.dishes) {
      pratos.push(
        ...data.dishes.map(dishId => ({
          id: dishId,
        } as Prato))
      )
    }

    return {
      ...meal,
      pratos
    }
  }

  async delete(params: DeleteMealsParams) {
    const mealIndex = this.database.findIndex(
      meal => meal.id === params.id && meal.cardapioId === params.menuId
    )

    if (mealIndex === -1) {
      throw new ResourceNotFoundError()
    }

    this.database.splice(mealIndex, 1)
  }
}