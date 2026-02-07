import { TipoRefeicao } from "@/generated/prisma/enums"
import { makeRegenarateSuggestionsUseCase } from "@/use-cases/factories/menu-ai/make-regenerate-suggestions-use-case"
import { ResourceNotFoundError } from "@/utils/errors/resource-not-found-error"
import { FastifyReply, FastifyRequest } from "fastify"
import { z } from "zod"

export async function regenerate(request: FastifyRequest, reply: FastifyReply) {
  const regenerateParamsSchema = z.object({
    menuId: z.string().uuid(),
  })

  const regenerateBodySchema = z.object({
    type: z.nativeEnum(TipoRefeicao),
    date: z.coerce.date(),
    previousSuggestions: z.array(z.string()),
  })

  const { menuId } = regenerateParamsSchema.parse(request.params)
  const { type, date, previousSuggestions } = regenerateBodySchema.parse(request.body)

  try {
    const regenerateSuggestionsUseCase = makeRegenarateSuggestionsUseCase()

    const suggestions = await regenerateSuggestionsUseCase.execute(
      { menuId },
      {
        type,
        date,
        previousSuggestions,
      }
    )

    return reply.status(200).send(suggestions)
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