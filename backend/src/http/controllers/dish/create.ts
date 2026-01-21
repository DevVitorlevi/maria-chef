import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import { CategoriaPrato } from "@/generated/prisma/enums";
import { makeCreateDishUseCase } from "@/use-cases/factories/dish/make-create-dish-use-case";

export async function create(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const dishBodySchema = z.object({
    nome: z.string().min(1),
    categoria: z.nativeEnum(CategoriaPrato),
  });

  const { nome, categoria } = dishBodySchema.parse(request.body);

  const createDishUseCase = makeCreateDishUseCase();

  const { dish } = await createDishUseCase.execute({
    nome,
    categoria,
  });

  return reply.status(201).send(
    dish,
  );
}
