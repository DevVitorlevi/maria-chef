import { CategoriaIngrediente, CategoriaPrato } from "@/generated/prisma/enums";
import type { FastifyInstance } from "fastify";
import request from "supertest";

interface Ingrediente {
  nome: string;
  quantidade: number;
  unidade: string;
  categoria: CategoriaIngrediente;
}

interface CreateDishParams {
  nome?: string;
  categoria?: CategoriaPrato;
  ingredientes?: Ingrediente[];
}

export async function createDish(
  app: FastifyInstance,
  params: CreateDishParams = {}
) {
  const {
    nome = "Pizza Margherita",
    categoria = CategoriaPrato.LANCHE,
  } = params;

  const response = await request(app.server)
    .post("/dish")
    .send({
      nome,
      categoria,
    });

  return response;
}