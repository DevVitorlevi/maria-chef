import type { FastifyInstance } from "fastify";
import { create } from "../controllers/dish/create";

export function dishRoutes(app: FastifyInstance) {
  app.post("/dish", create)
}