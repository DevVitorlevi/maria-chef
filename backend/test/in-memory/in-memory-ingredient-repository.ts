import {
  Ingrediente,
} from "@/generated/prisma/client"
import type { CreateIngredientInput } from "@/repositories/DTOs/ingredient.dtos"
import type { IngredientRepository } from "@/repositories/ingredient-repository"
import { ResourceNotFoundError } from "@/utils/errors/resource-not-found-error"
import { Decimal } from "@prisma/client/runtime/client"
import { randomUUID } from "node:crypto"

export class InMemoryIngredientRepository implements IngredientRepository {
  public ingredients: Ingrediente[] = []

  async create(dishId: string, data: CreateIngredientInput): Promise<Ingrediente> {
    const ingredient: Ingrediente = {
      id: randomUUID(),
      nome: data.nome,
      quantidade: new Decimal(data.quantidade),
      unidade: data.unidade,
      categoria: data.categoria,
      pratoId: dishId
    }

    this.ingredients.push(ingredient)

    return ingredient
  }

  async update(
    dishId: string,
    ingredientId: string,
    data: CreateIngredientInput
  ): Promise<Ingrediente | null> {
    const ingredient = this.ingredients.find(
      ingredient =>
        ingredient.id === ingredientId &&
        ingredient.pratoId === dishId
    )

    if (!ingredient) {
      return null
    }

    ingredient.nome = data.nome
    ingredient.quantidade = new Decimal(data.quantidade)
    ingredient.unidade = data.unidade
    ingredient.categoria = data.categoria

    return ingredient
  }
  async delete(dishId: string, ingredientId: string) {
    const ingredientIndex = this.ingredients.findIndex(
      ingredient => ingredient.id === ingredientId && ingredient.pratoId === dishId
    )

    if (ingredientIndex === -1) {
      throw new ResourceNotFoundError()
    }

    this.ingredients.splice(ingredientIndex, 1)
  }
}