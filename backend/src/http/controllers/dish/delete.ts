import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import { makeDeleteDishUseCase } from "@/use-cases/factories/dish/make-delete-dish-use-case";
import { ResourceNotFoundError } from "@/utils/errors/resource-not-found-error";

export async function deleteDish(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const deleteDishParamsSchema = z.object({
    id: z.string()

  });

  const { id } = deleteDishParamsSchema.parse(request.params);

  try {
    const deleteDishUseCase = makeDeleteDishUseCase();

    await deleteDishUseCase.execute({
      id
    });

    return reply.status(204).send(
      {
        message: "Delete Dish"
      }
    );
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(400).send({
        message: error.message
      })
    }

    throw error
  }
}
