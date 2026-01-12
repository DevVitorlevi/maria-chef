import request from "supertest";
import { describe, it, beforeAll, afterAll, beforeEach, expect } from "vitest";

import { app } from "@/app";
import { prisma } from "@/lib/prisma";
import { CategoriaPrato, CategoriaIngrediente } from "@/generated/prisma/enums";
import { resetDatabase } from "test/utils/reset-database";

describe("Create Dish (E2E)", () => {
  beforeAll(async () => {
    await app.ready();
  });

  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  it("should create a dish with ingredients", async () => {
    const response = await request(app.server)
      .post("/dish")
      .send({
        nome: "Pizza Margherita",
        categoria: CategoriaPrato.LANCHE,
        ingredientes: [
          {
            nome: "Farinha",
            quantidade: 1,
            unidade: "kg",
            categoria: CategoriaIngrediente.OUTROS,
          },
          {
            nome: "Tomate",
            quantidade: 3,
            unidade: "un",
            categoria: CategoriaIngrediente.HORTIFRUTI,
          },
        ],
      });

    expect(response.status).toBe(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        nome: "Pizza Margherita",
        categoria: CategoriaPrato.LANCHE,
        ingredientes: expect.arrayContaining([
          expect.objectContaining({
            nome: "Farinha",
            quantidade: "1",
            unidade: "kg",
            categoria: CategoriaIngrediente.OUTROS,
          }),
          expect.objectContaining({
            nome: "Tomate",
            quantidade: "3",
            unidade: "un",
            categoria: CategoriaIngrediente.HORTIFRUTI,
          }),
        ]),
      })
    );
  });
});
