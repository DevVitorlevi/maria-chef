import type { FastifyInstance } from "fastify";
import { create } from "../controllers/menu/create";
import { findAll } from "../controllers/menu/findAll";
import { findById } from "../controllers/menu/findById";
import { update } from "../controllers/menu/update";

export function menuRoutes(app: FastifyInstance) {
  app.post("/cardapio", create)
  app.get("/cardapio/:menuId", findById)
  app.get("/cardapios", findAll)
  app.put("/cardapio/:id", update)
}