import { prisma } from '@/lib/prisma'
import type {
  CreateIngredientDTO,
  IngredientRepository,
} from '../ingredient-repository'

export class PrismaIngredientRepository implements IngredientRepository {
  async create(dishId: string, data: CreateIngredientDTO) {
    return await prisma.ingrediente.create({
      data: {
        ...data,
        pratoId: dishId,
      },
    })
  }

  async update(dishId: string, ingredientId: string, data: CreateIngredientDTO) {
    return await prisma.ingrediente.update({
      where: {
        id: ingredientId,
        pratoId: dishId
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