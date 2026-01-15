import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import { CategoriaIngrediente, CategoriaPrato } from "@/generated/prisma/enums";
import { makeUpdateDishUseCase } from "@/use-cases/factories/make-update-dish-use-case";
import { ResourceNotFoundError } from "@/utils/errors/resource-not-found-error";

export async function update(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const updateDishParamsSchema = z.object({
    id: z.string(),
  });

  const updateDishBodySchema = z.object({
    nome: z.string().min(1),
    categoria: z.nativeEnum(CategoriaPrato),
    ingredientes: z
      .array(
        z.object({
          nome: z.string().min(1),
          quantidade: z.number().positive(),
          unidade: z.string().min(1),
          categoria: z.nativeEnum(CategoriaIngrediente),
        })
      )
      .optional(),
  });

  const { id } = updateDishParamsSchema.parse(request.params);
  const { nome, categoria, ingredientes } = updateDishBodySchema.parse(request.body);

  try {
    const updateDishUseCase = makeUpdateDishUseCase();

    await updateDishUseCase.execute({
      id,
      nome,
      categoria,
      ...(ingredientes && ingredientes.length > 0 && { ingredientes }),
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