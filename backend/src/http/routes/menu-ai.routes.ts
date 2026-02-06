import type { FastifyInstance } from "fastify"
import { acceptSuggestions } from "../controllers/menu-ai/accept-suggestions"
import { suggests } from "../controllers/menu-ai/suggests"

export function menuAIRoutes(app: FastifyInstance) {
  app.post("/cardapio/:menuId/suggests", suggests)
  app.post("/cardapio/:menuId/accept-suggestions", acceptSuggestions)
}