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
    nome: z.string().min(1),
    categoria: z.nativeEnum(CategoriaPrato),
  });

  const { dishId } = updateDishParamsSchema.parse(request.params);
  const { nome, categoria } = updateDishBodySchema.parse(request.body);

  try {
    const updateDishUseCase = makeUpdateDishUseCase();

    await updateDishUseCase.execute(dishId, {
      nome,
      categoria,
    });

    return reply.status(204).send();
  } catch (error) {

    if (error instanceof ResourceNotFoundError) {
      return reply.status(400).send({
        message: error.message,
      });
    }

    throw error;
  }
}