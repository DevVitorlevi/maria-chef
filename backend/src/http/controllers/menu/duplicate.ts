import { makeDuplicateMenuUseCase } from "@/use-cases/factories/menu/make-duplicate-menu-use-case";
import { ResourceNotFoundError } from "@/utils/errors/resource-not-found-error";
import type { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";

export async function duplicate(request: FastifyRequest, reply: FastifyReply) {
  const duplicateMenuParamsSchema = z.object({
    menuId: z.string()
  })

  const { menuId } = duplicateMenuParamsSchema.parse(request.params)

  try {
    const duplicateMenuUseCase = makeDuplicateMenuUseCase()

    const { cardapio } = await duplicateMenuUseCase.execute({ menuId })

    return reply.status(200).send({
      message: " Duplicated Menu",
      cardapio
    })
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    if (error instanceof Error) {
      return reply.status(400).send({ message: error.message })
    }

    throw error
  }
}