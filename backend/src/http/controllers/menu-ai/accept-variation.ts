import { CategoriaIngrediente, CategoriaPrato } from '@/generated/prisma/enums'
import { makeAcceptVariationUseCase } from '@/use-cases/factories/menu-ai/make-accept-variation-use-case'
import { ResourceNotFoundError } from '@/utils/errors/resource-not-found-error'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function acceptVariation(request: FastifyRequest, reply: FastifyReply) {
  const acceptVariationParamsSchema = z.object({
    menuId: z.string().uuid(),
    mealId: z.string().uuid(),
    oldPlateId: z.string().uuid(),
  })

  const acceptVariationBodySchema = z.object({
    sugestaoEscolhida: z.object({
      nome: z.string(),
      categoria: z.nativeEnum(CategoriaPrato),
      ingredientes: z.array(
        z.object({
          nome: z.string(),
          quantidade: z.number().positive(),
          unidade: z.string(),
          categoria: z.nativeEnum(CategoriaIngrediente),
        })
      ),
    }),
  })

  const params = acceptVariationParamsSchema.parse(request.params)
  const body = acceptVariationBodySchema.parse(request.body)

  try {
    const acceptVariationUseCase = makeAcceptVariationUseCase()

    const input = {
      ...body,
      menuId: params.menuId,
    }

    const { dish } = await acceptVariationUseCase.execute(input, params)

    return reply.status(201).send({
      message: 'Variação aceita com sucesso e cardápio atualizado.',
      dish,
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