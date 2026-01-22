import type { FastifyInstance } from "fastify";
import { create } from "../controllers/menu/create";
import { findById } from "../controllers/menu/findById";

export function menuRoutes(app: FastifyInstance) {
  app.post("/cardapio", create)
  app.get("/cardapio/:menuId", findById)
}