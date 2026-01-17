import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import { CategoriaIngrediente, CategoriaPrato } from "@/generated/prisma/enums";
import { makeCreateDishUseCase } from "@/use-cases/factories/dish/make-create-dish-use-case";

export async function create(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const dishBodySchema = z.object({
    nome: z.string().min(1),
    categoria: z.nativeEnum(CategoriaPrato),
    ingredientes: z.array(
      z.object({
        nome: z.string().min(1),
        quantidade: z.number().positive(),
        unidade: z.string().min(1),
        categoria: z.nativeEnum(CategoriaIngrediente),
      })
    ).min(1),
  });

  const { nome, categoria, ingredientes } = dishBodySchema.parse(request.body);

  const createDishUseCase = makeCreateDishUseCase();

  const { prato } = await createDishUseCase.execute({
    nome,
    categoria,
    ingredientes,
  });

  return reply.status(201).send(
    prato,
  );
}
