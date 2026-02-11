import { TipoRefeicao } from "@/generated/prisma/enums"
import type { AISuggestedDish } from "@/repositories/DTOs/ai.dtos"
import { makeAcceptMenuAISuggestionsUseCase } from "@/use-cases/factories/menu-ai/make-accept-suggestions-use-case"
import { InvalidDateError } from "@/utils/errors/invalid-date-error"
import { ResourceNotFoundError } from "@/utils/errors/resource-not-found-error"
import type { FastifyReply, FastifyRequest } from "fastify"
import { z } from "zod"

const acceptSuggestionsParamsSchema = z.object({
  menuId: z.string().uuid("Menu ID deve ser um UUID válido"),
})

const ingredientSchema = z.object({
  nome: z.string().min(1, "Nome do ingrediente é obrigatório"),
  quantidade: z.number().positive("Quantidade deve ser positiva"),
  unidade: z.string().min(1, "Unidade é obrigatória"),
  categoria: z.string().min(1, "Categoria do ingrediente é obrigatória"),
})

const dishSchema = z.object({
  nome: z.string().min(1, "Nome do prato é obrigatório"),
  categoria: z.string().min(1, "Categoria do prato é obrigatória"),
  ingredientes: z.array(ingredientSchema).min(1, "Prato deve ter ao menos um ingrediente"),
})

const acceptSuggestionsBodySchema = z.object({
  type: z.nativeEnum(TipoRefeicao),
  date: z.coerce.date(),
  suggestions: z.array(dishSchema).min(1, "Deve haver ao menos uma sugestão"),
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

    return reply.status(201).send({
      success: true,
      message: "Sugestões aceitas com sucesso",
      data: result
    })
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({
        success: false,
        message: error.message || "Cardápio não encontrado"
      })
    }

    if (error instanceof InvalidDateError) {
      return reply.status(400).send({
        success: false,
        message: error.message || "Data fora do período do cardápio"
      })
    }

    if (error instanceof Error) {
      return reply.status(400).send({
        success: false,
        message: error.message
      })
    }

    console.error("Erro desconhecido em acceptSuggestions:", error)
    return reply.status(500).send({
      success: false,
      message: "Erro interno do servidor"
    })
  }
}