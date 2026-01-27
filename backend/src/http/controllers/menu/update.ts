import { makeUpdateMenuUseCase } from "@/use-cases/factories/menu/make-update-menu-use-case";
import { ResourceNotFoundError } from "@/utils/errors/resource-not-found-error";
import type { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";

export async function update(request: FastifyRequest, reply: FastifyReply) {
  const updateMenuParamsSchema = z.object({
    id: z.string(),
  })

  const updateMenuBodySchema = z.object({
    title: z.string().min(3, "Insira no Minimo 3 Caracteres").optional(),
    checkIn: z.coerce.date().optional(),
    checkOut: z.coerce.date().optional(),
    adults: z.number().min(1, "Deve Haver Pelo Menos 1 Adulto").optional(),
    kids: z.number().optional(),
    restricoes: z.array(z.string()).optional(),
    preferencias: z.string().nullable().optional()
  })

  const { id } = updateMenuParamsSchema.parse(request.params)
  const body = updateMenuBodySchema.parse(request.body)

  try {
    const updateMenuUseCase = makeUpdateMenuUseCase()

    const data = Object.fromEntries(
      Object.entries(body).filter(([_, value]) => value !== undefined)
    )

    const result = await updateMenuUseCase.execute(id, data)

    return reply.status(200).send(result)

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