import { makeFindByIdUseCase } from "@/use-cases/factories/dish/make-find-by-id-use-case";
import { ResourceNotFoundError } from "@/utils/errors/resource-not-found-error";
import type { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";

export async function findById(request: FastifyRequest, reply: FastifyReply) {
  const findByIdDishParamsSchema = z.object({
    dishId: z.string()
  })

  const { dishId } = findByIdDishParamsSchema.parse(request.params)

  try {
    const findByIdDishUseCase = makeFindByIdUseCase()

    const { dish } = await findByIdDishUseCase.execute({ dishId })

    return reply.status(200).send(
      { dish }
    )
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(400).send({
        message: error.message
      })
    }
    throw error
  }
}