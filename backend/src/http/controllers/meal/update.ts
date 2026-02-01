import { TipoRefeicao } from "@/generated/prisma/enums";
import { makeUpdateMealUseCase } from "@/use-cases/factories/meal/make-update-meal-use-case";
import { ResourceNotFoundError } from "@/utils/errors/resource-not-found-error";
import type { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";

export async function update(request: FastifyRequest, reply: FastifyReply) {
  const updateMealParamsSchema = z.object({
    mealId: z.string(),
    menuId: z.string()
  })

  const updateMealBodySchema = z.object({
    date: z.coerce.date().optional(),
    type: z.nativeEnum(TipoRefeicao).optional(),
    dishes: z.array(z.string().uuid()).min(1).optional(),
  })

  const { mealId, menuId } = updateMealParamsSchema.parse(request.params)

  const body = updateMealBodySchema.parse(request.body)

  try {
    const updateMealUseCase = makeUpdateMealUseCase()

    const data = Object.fromEntries(
      Object.entries(body).filter(([_, value]) => value !== undefined)
    )

    const { meal } = await updateMealUseCase.execute(
      { mealId, menuId },
      data
    )

    return reply.status(200).send({
      message: "Update Meal",
      meal
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