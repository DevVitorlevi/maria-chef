import {
  Ingrediente,
  Prato,
  Prisma,
  type CategoriaPrato,
} from "@/generated/prisma/client"
import type {
  DishRepository,
  DishWithIngredients,
} from "@/repositories/dish-repository"
import type { CreateDishInput, FindAllDishesFiltersInput } from "@/repositories/DTOs/dish.dtos"
import { ResourceNotFoundError } from "@/utils/errors/resource-not-found-error"
import { randomUUID } from "node:crypto"


type PrismaUpdateValue<T> =
  | T
  | { set?: T }
  | null
  | undefined

function resolveUpdateValue<T>(
  value: PrismaUpdateValue<T>
): T | undefined {
  if (value === null || value === undefined) {
    return undefined
  }

  if (typeof value === "object" && "set" in value) {
    return value.set
  }

  return value as T
}

export class InMemoryDishRepository implements DishRepository {
  public database: Prato[] = []
  public ingredients: Ingrediente[] = []

  async create(
    data: CreateDishInput
  ): Promise<Prato> {
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

  async findAll(
    params?: FindAllDishesFiltersInput
  ): Promise<Prato[]> {
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

  async findById(
    id: string
  ): Promise<DishWithIngredients | null> {
    const prato = this.database.find(p => p.id === id)

    if (!prato) {
      return null
    }

    const ingredientes = this.ingredients.filter(
      ingrediente => ingrediente.pratoId === prato.id
    )

    return {
      ...prato,
      ingredientes,
    }
  }

  async update(
    id: string,
    data: Prisma.PratoUpdateInput
  ): Promise<DishWithIngredients> {
    const pratoIndex = this.database.findIndex(
      prato => prato.id === id
    )

    if (pratoIndex === -1) {
      throw new Error("Prato não encontrado")
    }

    const pratoAtual = this.database[pratoIndex]!

    const nomeAtualizado = resolveUpdateValue<string>(
      data.nome
    )

    const categoriaAtualizada =
      resolveUpdateValue<CategoriaPrato>(
        data.categoria
      )

    const pratoAtualizado: Prato = {
      ...pratoAtual,
      nome: nomeAtualizado ?? pratoAtual.nome,
      categoria:
        categoriaAtualizada ?? pratoAtual.categoria,
    }

    this.database[pratoIndex] = pratoAtualizado

    if (data.ingredientes) {
      if (data.ingredientes.deleteMany) {
        this.ingredients = this.ingredients.filter(
          ingrediente => ingrediente.pratoId !== id
        )
      }

      if (data.ingredientes.create) {
        const ingredientesData = Array.isArray(
          data.ingredientes.create
        )
          ? data.ingredientes.create
          : [data.ingredientes.create]

        for (const ingredienteData of ingredientesData) {
          this.ingredients.push({
            id: randomUUID(),
            pratoId: id,
            nome: ingredienteData.nome,
            quantidade: new Prisma.Decimal(
              String(ingredienteData.quantidade)
            ),
            unidade: ingredienteData.unidade,
            categoria: ingredienteData.categoria,
          })
        }
      }
    }

    return {
      ...pratoAtualizado,
      ingredientes: this.ingredients.filter(
        ingrediente => ingrediente.pratoId === id
      ),
    }
  }

  async duplicate(
    id: string,
    data: Prisma.PratoUpdateInput
  ): Promise<DishWithIngredients> {
    const pratoOriginal = await this.findById(id)

    if (!pratoOriginal) {
      throw new Error("Prato não encontrado")
    }

    const nomeDuplicado = `${pratoOriginal.nome} (cópia)`
    const nomeAtualizado = resolveUpdateValue<string>(data.nome)
    const categoriaAtualizada = resolveUpdateValue<CategoriaPrato>(data.categoria)


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