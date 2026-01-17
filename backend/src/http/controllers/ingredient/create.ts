import { CategoriaIngrediente } from "@/generated/prisma/enums";
import { makeCreateIngredientUseCase } from "@/use-cases/factories/make-create-ingredient-use-case";
import { ResourceNotFoundError } from "@/utils/errors/resource-not-found-error";
import type { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const createIngredientParamsSchema = z.object({
    dishId: z.string()
  })

  const createIngredientBodySchema = z.object({
    nome: z.string().min(1),
    quantidade: z.number().positive(),
    unidade: z.string().min(1),
    categoria: z.nativeEnum(CategoriaIngrediente),
  })

  const { dishId } = createIngredientParamsSchema.parse(request.params)
  const { nome, quantidade, unidade, categoria } = createIngredientBodySchema.parse(request.body)

  try {
    const createIngredientUseCase = makeCreateIngredientUseCase()

    const { ingredient } = await createIngredientUseCase.execute({
      nome,
      quantidade,
      unidade,
      categoria,
      dishId
    })

    return reply.status(201).send({
      message: "Added Ingredient",
      ingredient
    })

  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(400).send({
        message: error.message
      })
    }
    throw error
  }

}