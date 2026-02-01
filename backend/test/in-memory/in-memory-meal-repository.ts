import type { Prato, Refeicao } from "@/generated/prisma/client";
import type { CreateMealInput, DeleteMealsParams, UpdateMealInput, UpdateMealOutput, UpdateMealParams } from "@/repositories/DTOs/meal.dtos";
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

  async update(params: UpdateMealParams, data?: UpdateMealInput): Promise<UpdateMealOutput> {
    const meal = this.database.find(
      meal => meal.id === params.mealId && meal.cardapioId === params.menuId
    )

    if (!meal) {
      throw new ResourceNotFoundError()
    }

    Object.assign(meal, {
      ...(data?.date !== undefined && { data: data.date }),
      ...(data?.type !== undefined && { tipo: data.type }),
    })

    if (data?.dishes !== undefined) {
      this.pratosRelation.set(meal.id, data.dishes)
    }

    const dishIds = this.pratosRelation.get(meal.id) || []
    const pratos: any[] = []

    if (this.dishRepository) {
      for (const dishId of dishIds) {
        const dish = this.dishRepository.database.find(
          (d: any) => d.id === dishId
        )
        if (dish) {
          pratos.push({
            id: dish.id,
            nome: dish.nome,
            categoria: dish.categoria,
            createdAt: dish.createdAt
          })
        }
      }
    }

    return {
      meal: {
        id: meal.id,
        cardapioId: meal.cardapioId,
        data: meal.data,
        tipo: meal.tipo,
        pratos,
        createdAt: meal.createdAt
      }
    }
  }
}