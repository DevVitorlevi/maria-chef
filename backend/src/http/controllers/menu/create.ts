import { makeCreateMenuUseCase } from "@/use-cases/factories/menu/make-create-menu-use-case";
import { InvalidDateError } from "@/utils/errors/invalid-date-error";
import type { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const createMenuBodySchema = z.object({
    title: z.string().min(3, "Insira no Minimo 3 Caracteres"),
    checkIn: z.coerce.date(),
    checkOut: z.coerce.date(),
    adults: z.number().min(1, "Deve Haver Pelo Menos 1 Adulto"),
    kids: z.number().optional(),
    restricoes: z.array(z.string()).optional(),
    preferencias: z.string().optional()
  })

  const { title, checkIn, checkOut, adults, kids, restricoes, preferencias } =
    createMenuBodySchema.parse(request.body)

  try {
    const createMenuUseCase = makeCreateMenuUseCase()

    const menu = await createMenuUseCase.execute({
      title,
      checkIn,
      checkOut,
      adults,
      kids: kids ?? 0,
      restricoes: restricoes ?? [],
      preferencias: preferencias ?? undefined
    })

    return reply.status(201).send(
      menu
    )
  } catch (error) {
    if (error instanceof InvalidDateError) {
      return reply.status(400).send({
        message: error.message
      })
    }

    throw error
  }
}