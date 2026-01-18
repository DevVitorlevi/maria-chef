import type { FastifyInstance } from "fastify";
import { create } from "../controllers/ingredient/create";
import { update } from "../controllers/ingredient/update";

export function ingredientroutes(app: FastifyInstance) {
  app.post("/dish/:dishId/ingredient", create)
  app.put("/dish/:dishId/ingredient/:ingredientId", update)
}