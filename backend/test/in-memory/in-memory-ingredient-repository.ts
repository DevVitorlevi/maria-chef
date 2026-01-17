import {
  Ingrediente,
} from "@/generated/prisma/client"
import type { CreateIngredientDTO, IngredientRepository } from "@/repositories/ingredient-repository"
import { Decimal } from "@prisma/client/runtime/client"
import { randomUUID } from "node:crypto"

export class InMemoryIngredientRepository implements IngredientRepository {
  public ingredients: Ingrediente[] = []

  async create(dishId: string, data: CreateIngredientDTO): Promise<Ingrediente> {
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

}