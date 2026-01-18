import { CategoriaIngrediente } from "@/generated/prisma/enums";
import { makeUpdateIngredientUseCase } from "@/use-cases/factories/ingredient/make-update-ingredient-use-case";
import { ResourceNotFoundError } from "@/utils/errors/resource-not-found-error";
import type { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";

export async function update(request: FastifyRequest, reply: FastifyReply) {
  const updateIngredientParamsSchema = z.object({
    dishId: z.string(),
    ingredientId: z.string()
  })

  const updateIngredientBodySchema = z.object({
    nome: z.string().min(1),
    quantidade: z.number().positive(),
    unidade: z.string().min(1),
    categoria: z.nativeEnum(CategoriaIngrediente),
  })

  const { dishId, ingredientId } = updateIngredientParamsSchema.parse(request.params)
  const { nome, quantidade, unidade, categoria } = updateIngredientBodySchema.parse(request.body)

  try {
    const updateIngredientUseCase = makeUpdateIngredientUseCase()

    await updateIngredientUseCase.execute({
      nome,
      quantidade,
      unidade,
      categoria,
      dishId,
      ingredientId
    })

    return reply.status(204).send({
      message: "Updated Ingredient",
    })

  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(400).send({
        message: error.message
      })
    }
    throw error
  }
}