import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import { CategoriaPrato } from "@/generated/prisma/enums";
import { makeUpdateDishUseCase } from "@/use-cases/factories/dish/make-update-dish-use-case";
import { ResourceNotFoundError } from "@/utils/errors/resource-not-found-error";

export async function update(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const updateDishParamsSchema = z.object({
    dishId: z.string(),
  });

  const updateDishBodySchema = z.object({
    nome: z.string().min(1).optional(),
    categoria: z.nativeEnum(CategoriaPrato).optional(),
  });

  const { dishId } = updateDishParamsSchema.parse(request.params);
  const { nome, categoria } = updateDishBodySchema.parse(request.body);

  try {
    const updateDishUseCase = makeUpdateDishUseCase();

    const dish = await updateDishUseCase.execute(dishId, {
      ...(nome !== undefined && { nome }),
      ...(categoria !== undefined && { categoria }),
    });

    return reply.status(200).send({
      message: "Updated Dish",
      dish
    });

  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({
        message: error.message,
      });
    }

    throw error;
  }
}