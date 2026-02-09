import type { FastifyInstance } from "fastify"
import { acceptSuggestions } from "../controllers/menu-ai/accept-suggestions"
import { regenerate } from "../controllers/menu-ai/regenerate-suggestions"
import { suggests } from "../controllers/menu-ai/suggests"
import { suggestsVariation } from "../controllers/menu-ai/suggests-variation"
import { acceptVariation } from "../controllers/menu-ai/accept-variation"

export function menuAIRoutes(app: FastifyInstance) {
  app.post("/cardapio/:menuId/suggests", suggests)
  app.post("/cardapio/:menuId/accept-suggestions", acceptSuggestions)
  app.post("/cardapio/:menuId/regenarate-suggestions", regenerate)
  app.post("/cardapio/:menuId/variations", suggestsVariation)
  app.patch(
    '/cardapio/:menuId/meals/:mealId/variations/:oldPlateId/accept',
    acceptVariation
  )
}