import { makeFindByIdMenuUseCase } from "@/use-cases/factories/menu/make-find-by-id-use-case";
import { ResourceNotFoundError } from "@/utils/errors/resource-not-found-error";
import type { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";

export async function findById(request: FastifyRequest, reply: FastifyReply) {
  const findByIdMenuBodyParams = z.object({
    menuId: z.string()
  })

  const { menuId } =
    findByIdMenuBodyParams.parse(request.params)

  try {
    const findByIdMenuUseCase = makeFindByIdMenuUseCase()

    const menu = await findByIdMenuUseCase.execute({
      menuId
    })

    return reply.status(200).send(
      menu
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