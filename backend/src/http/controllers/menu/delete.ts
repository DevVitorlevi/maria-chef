import { makeDeleteMenuUseCase } from "@/use-cases/factories/menu/make-delete-menu-use-case";
import { ResourceNotFoundError } from "@/utils/errors/resource-not-found-error";
import type { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";

export async function deleteMenu(request: FastifyRequest, reply: FastifyReply) {
  const deleteMenuParamsSchema = z.object({
    id: z.string()
  })

  const { id } = deleteMenuParamsSchema.parse(request.params)

  try {
    const deleteMenuUseCase = makeDeleteMenuUseCase()

    await deleteMenuUseCase.execute({ id })

    return reply.status(204).send({
      message: "Delete Menu"
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