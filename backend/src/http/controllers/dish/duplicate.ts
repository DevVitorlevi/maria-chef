import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import { makeDuplicateDishUseCase } from "@/use-cases/factories/dish/make-duplicate-dish-use-case";

export async function duplicate(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const duplicateDishParamsSchema = z.object({
    dishId: z.string().uuid({ message: "ID inválido" }),
  });

  const { dishId } = duplicateDishParamsSchema.parse(request.params);

  try {
    const duplicateDishUseCase = makeDuplicateDishUseCase();

    const { dish } = await duplicateDishUseCase.execute({
      dishId,
    });

    return reply.status(201).send(dish);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Prato não encontrado") {
        return reply.status(404).send({
          message: error.message,
        });
      }

      if (error.message === "ID inválido") {
        return reply.status(400).send({
          message: error.message,
        });
      }
    }

    throw error;
  }
} 