import { TipoRefeicao } from "@/generated/prisma/enums"
import { makeMenuAISuggestsUseCase } from "@/use-cases/factories/menu-ai/make-suggests-menu-ai-use-case"
import { ResourceNotFoundError } from "@/utils/errors/resource-not-found-error"
import type { FastifyReply, FastifyRequest } from "fastify"
import { z } from "zod"

const suggestsMenuAIParamsSchema = z.object({
  menuId: z.string(),
})

const suggestsMenuAIBodySchema = z.object({
  type: z.nativeEnum(TipoRefeicao),
  date: z.coerce.date(),
  context: z.object({
    title: z.string(),
    checkin: z.coerce.date(),
    checkout: z.coerce.date(),
    adults: z.number().int().nonnegative(),
    kids: z.number().int().nonnegative(),
    restricoes: z.array(z.string()),
    preferencias: z.string().optional(),
  }),
})

export async function suggests(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { menuId } = suggestsMenuAIParamsSchema.parse(request.params)
    const { type, date, context } =
      suggestsMenuAIBodySchema.parse(request.body)

    const menuAISuggestsUseCase = makeMenuAISuggestsUseCase()

    const suggestions = await menuAISuggestsUseCase.execute(
      { menuId },
      {
        type,
        date,
        context: {
          id: menuId,
          title: context.title,
          checkin: context.checkin,
          checkout: context.checkout,
          adults: context.adults,
          kids: context.kids,
          restricoes: context.restricoes,
          ...(context.preferencias && {
            preferencias: context.preferencias,
          }),
        },
      },
    )

    return reply.status(200).send(suggestions)
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
