import { makeFindByIdMealUseCase } from "@/use-cases/factories/meal/make-find-by-id-meal-use-case";
import { ResourceNotFoundError } from "@/utils/errors/resource-not-found-error";
import type { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";

export async function findById(request: FastifyRequest, reply: FastifyReply) {
  const findByIdParamsSchema = z.object({
    id: z.string(),
    menuId: z.string()
  })

  const { id, menuId } = findByIdParamsSchema.parse(request.params)

  try {

    const findByIdMealUseCase = makeFindByIdMealUseCase()

    const { meal } = await findByIdMealUseCase.execute({ id, menuId })

    return reply.status(200).send(meal)

  } catch (error) {

    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    if (error instanceof Error && error.message === "Serviço de IA temporariamente indisponível") {
      return reply.status(503).send({ message: error.message })
    }

    if (error instanceof Error) {
      return reply.status(400).send({ message: error.message })
    }

    throw error
  }
}