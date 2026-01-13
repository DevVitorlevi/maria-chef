import type { FastifyInstance } from "fastify";
import { create } from "../controllers/dish/create";
import { findAll } from "../controllers/dish/findAll";
import { findById } from "../controllers/dish/findById";

export function dishRoutes(app: FastifyInstance) {
  app.post("/dish", create)
  app.get("/dish", findAll)
  app.get("/dish/:id", findById)
}