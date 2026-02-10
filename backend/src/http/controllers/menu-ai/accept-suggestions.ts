import { TipoRefeicao } from "@/generated/prisma/enums"
import type { AISuggestedDish } from "@/repositories/DTOs/ai.dtos"
import { makeAcceptMenuAISuggestionsUseCase } from "@/use-cases/factories/menu-ai/make-accept-suggestions-use-case"
import { ResourceNotFoundError } from "@/utils/errors/resource-not-found-error"
import type { FastifyReply, FastifyRequest } from "fastify"
import { z } from "zod"

const acceptSuggestionsParamsSchema = z.object({
  menuId: z.string(),
})

const ingredientSchema = z.object({
  nome: z.string(),
  quantidade: z.number(),
  unidade: z.string(),
  categoria: z.string(),
})

const dishSchema = z.object({
  nome: z.string(),
  categoria: z.string(),
  ingredientes: z.array(ingredientSchema),
})

const acceptSuggestionsBodySchema = z.object({
  type: z.nativeEnum(TipoRefeicao),
  date: z.coerce.date(),
  suggestions: z.array(dishSchema),
})

export async function acceptSuggestions(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { menuId } = acceptSuggestionsParamsSchema.parse(request.params)
    const { type, date, suggestions } = acceptSuggestionsBodySchema.parse(request.body)

    const acceptSuggestionsUseCase = makeAcceptMenuAISuggestionsUseCase()

    const result = await acceptSuggestionsUseCase.execute(
      { menuId },
      { type, date, dishes: suggestions as AISuggestedDish[] }
    )

    return reply.status(201).send(result)
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