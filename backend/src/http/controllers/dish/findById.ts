import { makeFindByIdUseCase } from "@/use-cases/factories/make-find-by-id-use-case";
import { ResourceNotFoundError } from "@/utils/errors/resource-not-found-error";
import type { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";

export async function findById(request: FastifyRequest, reply: FastifyReply) {
  const findByIdDishParamsSchema = z.object({
    id: z.string()
  })

  const { id } = findByIdDishParamsSchema.parse(request.params)

  try {
    const findByIdDishUseCase = makeFindByIdUseCase()

    const { prato } = await findByIdDishUseCase.execute({ id })

    return reply.status(200).send(
      { prato }
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