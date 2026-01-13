import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import { CategoriaPrato } from "@/generated/prisma/enums";
import { makeFindAllDishesUseCase } from "@/use-cases/factories/make-find-all-dishes-use-case";

export async function findAll(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const findAllDishesQuerySchema = z.object({
    nome: z.string().min(1).optional(),
    categoria: z.nativeEnum(CategoriaPrato).optional(),
  });

  const { nome, categoria } = findAllDishesQuerySchema.parse(request.query);

  const findAllDishesUseCase = makeFindAllDishesUseCase();

  const { pratos } = await findAllDishesUseCase.execute({
    nome,
    categoria,
  });

  return reply.status(200).send(
    { pratos }
  );
}
