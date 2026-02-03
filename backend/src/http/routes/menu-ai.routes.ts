import type { FastifyInstance } from "fastify";
import { suggests } from "../controllers/menu-ai/suggests";

export function menuAIRoutes(app: FastifyInstance) {
  app.post("/cardapio/:menuId/suggests", suggests)
}