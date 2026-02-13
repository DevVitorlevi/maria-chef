import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/client";
import type { DishRepository } from "../dish-repository";
import type { CreateDishInput, FindAllDishesFiltersInput, FindByIdDishParams, UpdateDishInput } from "../DTOs/dish.dtos";
export class PrismaDishRepository implements DishRepository {
  async create(data: CreateDishInput) {
    const dish = await prisma.dish.create({
      data,
    });
    return { dish };
  }

  async findAll(filters?: FindAllDishesFiltersInput) {
    const dishes = await prisma.dish.findMany({
      where: {
        ...(filters?.name && {
          name: {
            contains: filters.name,
            mode: 'insensitive'
          }
        }),
        ...(filters?.category && {
          category: filters.category
        })
      }
    })
    return { dishes }
  }

  async findById({ dishId }: FindByIdDishParams) {
    const dish = await prisma.dish.findUnique({
      where: {
        id: dishId
      },
      include: {
        ingredients: true
      }
    })

    if (!dish) {
      return null;
    }

    return {
      dish: {
        id: dish.id,
        name: dish.name,
        category: dish.category,
        createdAt: dish.createdAt,
        ingredients: dish.ingredients.map(ingredient => ({
          id: ingredient.id,
          name: ingredient.name,
          quantify: new Decimal(ingredient.quantify),
          unit: ingredient.unit,
          category: ingredient.category,
          dishId: ingredient.dishId
        }))
      }
    };
  }

  async update(
    dishId: string,
    data: UpdateDishInput
  ) {
    const dish = await prisma.dish.update({
      where: { id: dishId },
      data,
      include: {
        ingredients: true
      }
    });

    return {
      dish
    };
  }

  async duplicate(dishId: string) {
    const originalDish = await prisma.dish.findUnique({
      where: { id: dishId },
      include: {
        ingredients: true,
      },
    });

    if (!originalDish) {
      throw new Error("dish não encontrado");
    }

    const duplicateName = `${originalDish.name} (cópia)`;

    const duplicateDish = await prisma.dish.create({
      data: {
        name: duplicateName,
        category: originalDish.category,
        ingredients: {
          create: originalDish.ingredients.map((ingredient) => ({
            name: ingredient.name,
            quantify: ingredient.quantify,
            unit: ingredient.unit,
            category: ingredient.category,
          })),
        },
      },
      include: {
        ingredients: true,
      },
    });

    return {
      dish: duplicateDish
    };
  }

  async delete(id: string) {
    await prisma.dish.delete({
      where: {
        id
      }
    })
  }
}