import { prisma } from '@/lib/prisma'
import type { CreateIngredientInput, UpdateIngredientInput, UpdateIngredientParams } from '../DTOs/ingredient.dtos'
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
  async delete(dishId: string, ingredientId: string) {
    return await prisma.ingrediente.delete({
      where: {
        pratoId: dishId,
        id: ingredientId
      }
    })
  }
}