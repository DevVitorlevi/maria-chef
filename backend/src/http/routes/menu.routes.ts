import type { FastifyInstance } from "fastify";
import { create } from "../controllers/menu/create";

export function menuRoutes(app: FastifyInstance) {
  app.post("/cardapio", create)
}