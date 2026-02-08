import { TipoRefeicao } from "@/generated/prisma/enums"
import { makeSuggestsVariationUseCase } from "@/use-cases/factories/menu-ai/make-suggests-variation-use-case"
import { ResourceNotFoundError } from "@/utils/errors/resource-not-found-error"
import type { FastifyReply, FastifyRequest } from "fastify"
import { z } from "zod"

export async function suggestsVariation(request: FastifyRequest, reply: FastifyReply) {
  const suggestsVariationParamsSchema = z.object({
    menuId: z.string().uuid(),
  })

  const suggestsVariationBodySchema = z.object({
    pratoOriginal: z.string().min(1),
    contexto: z.object({
      tipo: z.nativeEnum(TipoRefeicao),
    }),
  })

  const { menuId } = suggestsVariationParamsSchema.parse(request.params)
  const { pratoOriginal, contexto } = suggestsVariationBodySchema.parse(request.body)

  try {
    const suggestsVariationUseCase = makeSuggestsVariationUseCase()

    const { dishes, categoria, notes } = await suggestsVariationUseCase.execute({
      menuId,
      pratoOriginal,
      contexto: {
        tipo: contexto.tipo,
        restricoes: [],
        preferencias: "",
      },
    })

    return reply.status(200).send({
      dishes,
      categoria,
      notes,
    })
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