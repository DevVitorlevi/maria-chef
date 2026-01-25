import { makeDeleteMealUseCase } from "@/use-cases/factories/meal/make-delete-meal-use-case";
import { ResourceNotFoundError } from "@/utils/errors/resource-not-found-error";
import type { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";

export async function deleteMeal(request: FastifyRequest, reply: FastifyReply) {
  const deleteMealParamsSchema = z.object({
    id: z.string(),
    menuId: z.string()
  })

  const { id, menuId } = deleteMealParamsSchema.parse(request.params)

  try {
    const deleteMealUseCase = makeDeleteMealUseCase()

    await deleteMealUseCase.execute({ id, menuId })

    return reply.status(204).send({
      message: "Delete Meal"
    })
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(400).send({
        message: error.message,
      })
    }
    return reply.status(500).send({
      message: "Erro ao deletar",
      error: error instanceof Error ? error.message : "Erro desconhecido"
    })
  }
}