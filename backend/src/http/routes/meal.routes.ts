import type { FastifyInstance } from "fastify";
import { create } from "../controllers/meal/create";
import { deleteMeal } from "../controllers/meal/delete";
import { update } from "../controllers/meal/update";

export function mealRoutes(app: FastifyInstance) {
  app.post("/cardapio/:menuId/refeicao", create)
  app.delete("/cardapio/:menuId/refeicao/:id", deleteMeal)
  app.put("/cardapio/:menuId/refeicao/:mealId", update)
}