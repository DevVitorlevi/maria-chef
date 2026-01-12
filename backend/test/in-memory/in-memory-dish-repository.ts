import { Ingrediente, Prato, Prisma } from "@/generated/prisma/client"
import type { DishRepository, DishWithIngredients } from "@/repositories/dish-repository"
import { randomUUID } from "node:crypto"


export class InMemoryDishRepository implements DishRepository {
  public database: Prato[] = []
  public ingredients: Ingrediente[] = []

  async create(data: Prisma.PratoCreateInput): Promise<DishWithIngredients> {
    const prato: Prato = {
      id: randomUUID(),
      nome: data.nome,
      categoria: data.categoria,
      createdAt: new Date(),
    }

    this.database.push(prato)

    const createdIngredients: Ingrediente[] = []

    if (data.ingredientes?.create) {
      const ingredientesData = Array.isArray(data.ingredientes.create)
        ? data.ingredientes.create
        : [data.ingredientes.create]

      for (const ingredienteData of ingredientesData) {
        const ingrediente: Ingrediente = {
          id: randomUUID(),
          pratoId: prato.id,
          nome: ingredienteData.nome,
          quantidade: new Prisma.Decimal(String(ingredienteData.quantidade)),
          unidade: ingredienteData.unidade,
          categoria: ingredienteData.categoria,
        }

        this.ingredients.push(ingrediente)
        createdIngredients.push(ingrediente)
      }
    }

    return {
      ...prato,
      ingredientes: createdIngredients,
    }
  }
  async findAll(): Promise<Prato[]> {
    return this.database
  }

}