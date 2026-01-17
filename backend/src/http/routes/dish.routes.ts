import type { FastifyInstance } from "fastify";
import { create } from "../controllers/dish/create";
import { duplicate } from "../controllers/dish/duplicate";
import { findAll } from "../controllers/dish/findAll";
import { findById } from "../controllers/dish/findById";
import { update } from "../controllers/dish/update";
import { deleteDish } from "../controllers/dish/delete";

export function dishRoutes(app: FastifyInstance) {
  app.post("/dish", create)
  app.get("/dish", findAll)
  app.get("/dish/:id", findById)
  app.put("/dish/:id", update)
  app.post("/dish/:dishId/duplicate", duplicate)
  app.delete("/dish/:id/delete", deleteDish)
}