import { prisma } from '@/lib/prisma'
import type { CreateIngredientInput, DeleteIngredientParams, UpdateIngredientInput, UpdateIngredientParams } from '../DTOs/ingredient.dtos'
import type {
  IngredientRepository,
} from '../ingredient-repository'

export class PrismaIngredientRepository implements IngredientRepository {
  async create(dishId: string, data: CreateIngredientInput) {
    return await prisma.ingrediente.create({
      data: {
        ...data,
        pratoId: dishId,
      },
    })
  }

  async update(params: UpdateIngredientParams, data: UpdateIngredientInput) {
    return await prisma.ingrediente.update({
      where: {
        id: params.ingredientId,
        pratoId: params.dishId
      },
      data
    })
  }
  async delete(params: DeleteIngredientParams) {
    return await prisma.ingrediente.delete({
      where: {
        pratoId: params.dishId,
        id: params.ingredientId
      }
    })
  }
}