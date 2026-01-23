import { TipoRefeicao } from "@/generated/prisma/enums"
import { makeCreateMealUseCase } from "@/use-cases/factories/meal/make-create-meal-use-case"
import { ResourceNotFoundError } from "@/utils/errors/resource-not-found-error"
import type { FastifyReply, FastifyRequest } from "fastify"
import z from "zod"

export async function create(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const paramsSchema = z.object({
    menuId: z.string().uuid(),
  })

  const bodySchema = z.object({
    date: z.coerce.date(),
    type: z.nativeEnum(TipoRefeicao),
    dishes: z.array(z.string().uuid()).min(1),
  })

  const { menuId } = paramsSchema.parse(request.params)
  const { date, type, dishes } = bodySchema.parse(request.body)

  try {
    const createMealUseCase = makeCreateMealUseCase()

    const { meal } = await createMealUseCase.execute({
      menuId,
      date,
      type,
      dishes,
    })

    return reply.status(201).send({
      message: "Meal created successfully",
      meal,
    })
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({
        message: "Menu not found",
      })
    }

    throw error
  }
}
