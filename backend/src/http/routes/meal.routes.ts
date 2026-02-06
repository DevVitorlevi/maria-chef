import type { FastifyInstance } from "fastify";
import { create } from "../controllers/meal/create";
import { deleteMeal } from "../controllers/meal/delete";
import { update } from "../controllers/meal/update";
import { findById } from "../controllers/meal/findById";

export function mealRoutes(app: FastifyInstance) {
  app.post("/cardapio/:menuId/refeicao", create)
  app.delete("/cardapio/:menuId/refeicao/:id", deleteMeal)
  app.put("/cardapio/:menuId/refeicao/:mealId", update)
  app.get("cardapio/:menuId/refeicao/:mealId", findById)
}