import type { FastifyInstance } from "fastify";
import { create } from "../controllers/meal/create";
import { deleteMeal } from "../controllers/meal/delete";

export function mealRoutes(app: FastifyInstance) {
  app.post("/cardapio/:menuId/refeicao", create)
  app.delete("/cardapio/:menuId/refeicao/:id", deleteMeal)
}