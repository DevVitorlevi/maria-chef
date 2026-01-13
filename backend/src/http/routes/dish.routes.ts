import type { FastifyInstance } from "fastify";
import { create } from "../controllers/dish/create";
import { findAll } from "../controllers/dish/findAll";

export function dishRoutes(app: FastifyInstance) {
  app.post("/dish", create)
  app.get("/dish", findAll)
}