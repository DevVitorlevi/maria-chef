import { CategoriaIngrediente, CategoriaPrato } from '@/generated/prisma/enums'
import { makeAcceptVariationUseCase } from '@/use-cases/factories/menu-ai/make-accept-variation-use-case'
import { ResourceNotFoundError } from '@/utils/errors/resource-not-found-error'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function acceptVariation(request: FastifyRequest, reply: FastifyReply) {
  const acceptVariationParamsSchema = z.object({
    menuId: z.string().uuid("Menu ID deve ser um UUID válido"),
    mealId: z.string().uuid("Meal ID deve ser um UUID válido"),
    oldPlateId: z.string().uuid("Old Plate ID deve ser um UUID válido"),
  })

  const acceptVariationBodySchema = z.object({
    sugestaoEscolhida: z.object({
      nome: z.string().min(1, "Nome do prato é obrigatório"),
      categoria: z.nativeEnum(CategoriaPrato),
      ingredientes: z.array(
        z.object({
          nome: z.string().min(1, "Nome do ingrediente é obrigatório"),
          quantidade: z.number().positive("Quantidade deve ser positiva"),
          unidade: z.string().min(1, "Unidade é obrigatória"),
          categoria: z.nativeEnum(CategoriaIngrediente),
        })
      ).min(1, "Prato deve ter ao menos um ingrediente"),
    }),
  })

  try {
    const params = acceptVariationParamsSchema.parse(request.params)
    const body = acceptVariationBodySchema.parse(request.body)

    const acceptVariationUseCase = makeAcceptVariationUseCase()

    const { dish } = await acceptVariationUseCase.execute(body, params)

    return reply.status(201).send({
      success: true,
      message: 'Variação aceita com sucesso e cardápio atualizado.',
      data: { dish },
    })
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({
        success: false,
        message: error.message || "Recurso não encontrado"
      })
    }

    if (error instanceof Error) {
      return reply.status(400).send({
        success: false,
        message: error.message
      })
    }

    console.error("Erro desconhecido em acceptVariation:", error)
    return reply.status(500).send({
      success: false,
      message: "Erro interno do servidor"
    })
  }
}