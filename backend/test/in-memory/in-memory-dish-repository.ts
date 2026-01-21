import {
  Ingrediente,
  Prato,
} from "@/generated/prisma/client"
import type {
  DishRepository,
  DishWithIngredients,
} from "@/repositories/dish-repository"
import type {
  CreateDishInput,
  DuplicateDishInput,
  FindAllDishesFiltersInput,
  FindByIdDishParams,
  UpdateDishInput
} from "@/repositories/DTOs/dish.dtos"
import { ResourceNotFoundError } from "@/utils/errors/resource-not-found-error"
import { randomUUID } from "node:crypto"

export class InMemoryDishRepository implements DishRepository {
  public database: Prato[] = []
  public ingredients: Ingrediente[] = []

  constructor(sharedIngredients?: Ingrediente[]) {
    if (sharedIngredients) {
      this.ingredients = sharedIngredients
    }
  }

  async create(data: CreateDishInput): Promise<Prato> {
    const prato: Prato = {
      id: randomUUID(),
      nome: data.nome,
      categoria: data.categoria,
      createdAt: new Date(),
    }

    this.database.push(prato)

    return {
      ...prato,
    }
  }

  async findAll(params?: FindAllDishesFiltersInput): Promise<Prato[]> {
    let result = this.database

    if (params?.nome) {
      const nomeLowerCase = params.nome.toLowerCase()
      result = result.filter(prato =>
        prato.nome.toLowerCase().includes(nomeLowerCase)
      )
    }

    if (params?.categoria) {
      result = result.filter(
        prato => prato.categoria === params.categoria
      )
    }

    return result
  }

  async findById(params: FindByIdDishParams): Promise<DishWithIngredients | null> {
    const dishId = typeof params === 'string' ? params : params.dishId

    const prato = this.database.find((p) => p.id === dishId)

    if (!prato) {
      return null
    }

    const ingredientes = this.ingredients.filter((i) => i.pratoId === dishId)

    return {
      ...prato,
      ingredientes,
    }
  }

  async update(dishId: string, data: UpdateDishInput) {
    const dish = this.database.find(dish => dish.id === dishId)

    if (!dish) {
      return null
    }

    dish.nome = data.nome
    dish.categoria = data.categoria

    return dish
  }

  async duplicate(
    dishId: string,
    data?: DuplicateDishInput
  ): Promise<DishWithIngredients> {
    const pratoOriginal = await this.findById({ dishId })

    if (!pratoOriginal) {
      throw new Error("Prato não encontrado")
    }

    const nomeDuplicado = `${pratoOriginal.nome} (cópia)`
    const nomeAtualizado = data?.nome
    const categoriaAtualizada = data?.categoria

    const pratoDuplicado: Prato = {
      id: randomUUID(),
      nome: nomeAtualizado ?? nomeDuplicado,
      categoria: categoriaAtualizada ?? pratoOriginal.categoria,
      createdAt: new Date(),
    }

    this.database.push(pratoDuplicado)

    const ingredientesDuplicados: Ingrediente[] = []

    for (const ingredienteOriginal of pratoOriginal.ingredientes) {
      const ingredienteDuplicado: Ingrediente = {
        id: randomUUID(),
        pratoId: pratoDuplicado.id,
        nome: ingredienteOriginal.nome,
        quantidade: ingredienteOriginal.quantidade,
        unidade: ingredienteOriginal.unidade,
        categoria: ingredienteOriginal.categoria,
      }

      this.ingredients.push(ingredienteDuplicado)
      ingredientesDuplicados.push(ingredienteDuplicado)
    }

    return {
      ...pratoDuplicado,
      ingredientes: ingredientesDuplicados,
    }
  }

  async delete(id: string) {
    const dishIndex = this.database.findIndex(dish => dish.id === id)

    if (dishIndex === -1) {
      throw new ResourceNotFoundError()
    }

    this.database.splice(dishIndex, 1)
  }
}