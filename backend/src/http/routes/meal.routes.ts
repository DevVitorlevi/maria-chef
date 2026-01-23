import type { FastifyInstance } from "fastify";
import { create } from "../controllers/meal/create";

export function mealRoutes(app: FastifyInstance) {
  app.post("/cardapio/:menuId/refeicao", create)
}