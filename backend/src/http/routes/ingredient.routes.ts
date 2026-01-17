import type { FastifyInstance } from "fastify";
import { create } from "../controllers/ingredient/create";

export function ingredientroutes(app: FastifyInstance) {
  app.post("/dish/:dishId/ingredient", create)
}