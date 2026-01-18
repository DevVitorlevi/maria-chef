import { app } from "@/app";
import { CategoriaIngrediente, CategoriaPrato } from "@/generated/prisma/enums";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createDish } from "../../utils/create-dish";
import { resetDatabase } from "test/utils/reset-database";
import { prisma } from "@/lib/prisma";

describe("Update Dish (e2e)", () => {
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

  it("should be able to update a dish", async () => {
    const createResponse = await createDish(app, {
      nome: "Feijoada Antiga",
      categoria: CategoriaPrato.ALMOCO,
      ingredientes: [
        {
          nome: "Feijão",
          quantidade: 300,
          unidade: "g",
          categoria: CategoriaIngrediente.GRAOS,
        },
      ],
    });

    const dishId = createResponse.body.id

    const updateResponse = await request(app.server)
      .put(`/dish/${dishId}`)
      .send({
        nome: "Feijoada Completa",
        categoria: CategoriaPrato.ALMOCO,
        ingredientes: [
          {
            nome: "Feijão preto",
            quantidade: 500,
            unidade: "g",
            categoria: CategoriaIngrediente.GRAOS,
          },
          {
            nome: "Carne seca",
            quantidade: 300,
            unidade: "g",
            categoria: CategoriaIngrediente.PROTEINA,
          },
        ],
      });

    expect(updateResponse.statusCode).toEqual(204);
  });

  it("should not be able update an dish does not exist", async () => {
    const response = await request(app.server)
      .put("/dish/non-existent-id")
      .send({
        nome: "Prato Inexistente",
        categoria: CategoriaPrato.ALMOCO,
        ingredientes: [
          {
            nome: "Ingrediente",
            quantidade: 100,
            unidade: "g",
            categoria: CategoriaIngrediente.TEMPERO,
          },
        ],
      });

    expect(response.statusCode).toEqual(400);
  });

  it("should update only dish name and categoria keeping same ingredients structure", async () => {
    const createResponse = await createDish(app, {
      nome: "Prato Original",
      categoria: CategoriaPrato.LANCHE,
      ingredientes: [
        {
          nome: "Ingrediente 1",
          quantidade: 100,
          unidade: "g",
          categoria: CategoriaIngrediente.GRAOS,
        },
        {
          nome: "Ingrediente 2",
          quantidade: 200,
          unidade: "g",
          categoria: CategoriaIngrediente.PROTEINA,
        },
      ],
    });

    const dishId = createResponse.body.id
    const originalIngredients = createResponse.body.ingredientes;

    const payload = {
      nome: "Prato Atualizado",
      categoria: CategoriaPrato.ALMOCO,
      ingredientes: originalIngredients.map((ing: any) => ({
        nome: ing.nome,
        quantidade: Number(ing.quantidade),
        unidade: ing.unidade,
        categoria: ing.categoria,
      })),
    };

    const updateResponse = await request(app.server)
      .put(`/dish/${dishId}`)
      .send(payload);

    expect(updateResponse.statusCode).toEqual(204);

    const getResponse = await request(app.server).get(`/dish/${dishId}`);
    expect(getResponse.body.prato.ingredientes).toHaveLength(2);
  });
});