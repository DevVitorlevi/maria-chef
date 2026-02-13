import { prisma } from '@/lib/prisma'
import type { CreateIngredientInput, DeleteIngredientParams, UpdateIngredientInput, UpdateIngredientParams } from '../DTOs/ingredient.dtos'
import type {
  IngredientRepository,
} from '../ingredient-repository'

export class PrismaIngredientRepository implements IngredientRepository {
  async create(dishId: string, data: CreateIngredientInput) {
    const ingredient = await prisma.ingredient.create({
      data: {
        ...data,
        dishId,
      },
    })

    return {
      ingredient
    }
  }

  async update(params: UpdateIngredientParams, data: UpdateIngredientInput) {
    return await prisma.ingredient.update({
      where: {
        id: params.ingredientId,
        dishId: params.dishId
      },
      data
    })
  }
  async delete(params: DeleteIngredientParams) {
    return await prisma.ingredient.delete({
      where: {
        dishId: params.dishId,
        id: params.ingredientId
      }
    })
  }
}