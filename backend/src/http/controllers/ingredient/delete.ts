import { makeDeleteIngredientUseCase } from "@/use-cases/factories/ingredient/make-delete-ingredient-use-case";
import { ResourceNotFoundError } from "@/utils/errors/resource-not-found-error";
import type { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";

export async function deleteIngredient(request: FastifyRequest, reply: FastifyReply) {
  const deleteIngredientParamsSchema = z.object({
    dishId: z.string(),
    ingredientId: z.string()
  })

  const { dishId, ingredientId } = deleteIngredientParamsSchema.parse(request.params)

  try {
    const deleteIngredientUseCase = makeDeleteIngredientUseCase()

    await deleteIngredientUseCase.execute({
      dishId,
      ingredientId
    })

    return reply.status(204).send({
      message: "Deleted Ingredient",
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