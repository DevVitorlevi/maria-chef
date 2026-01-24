import { makeFindAllMenusUseCase } from "@/use-cases/factories/menu/make-find-all-menus-use-case";
import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function findAll(request: FastifyRequest, reply: FastifyReply) {
  const findAllMenusQuerySchema = z.object({
    titulo: z.string().optional(),
    data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD").optional(),
    page: z.coerce.number().int().positive().default(1).optional(),
    limit: z.coerce.number().int().positive().max(100).default(20).optional()
  })

  const { titulo, data, page, limit } = findAllMenusQuerySchema.parse(request.query)

  try {
    const findAllMenusUseCase = makeFindAllMenusUseCase()

    const result = await findAllMenusUseCase.execute({
      titulo,
      data,
      page,
      limit
    })

    return reply.status(200).send(result)
  } catch (error) {
    return reply.status(500).send({
      message: "Erro ao buscar cardápios",
      error: error instanceof Error ? error.message : "Erro desconhecido"
    })
  }
}