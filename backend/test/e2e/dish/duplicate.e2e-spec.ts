import { CategoriaIngrediente, CategoriaPrato } from "@/generated/prisma/enums";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createDish } from "../../utils/create-dish";
import { setupE2E } from '../../utils/setup-e2e';

describe("Duplicate Dish (e2e)", () => {
  let app: Awaited<ReturnType<typeof setupE2E>>

  beforeEach(async () => {
    app = await setupE2E()
  })

  it("should be able to duplicate a dish", async () => {
    const createResponse = await createDish(app)

    const dishId = createResponse.body.id

    await request(app.server)
      .post(`/dish/${dishId}/ingredient`)
      .send({
        nome: "Farinha de Trigo",
        quantidade: 1,
        unidade: "kg",
        categoria: CategoriaIngrediente.OUTROS,
      })

    await request(app.server)
      .post(`/dish/${dishId}/ingredient`)
      .send({
        nome: "Tomate",
        quantidade: 3,
        unidade: "un",
        categoria: CategoriaIngrediente.HORTIFRUTI,
      })

    const originalDishResponse = await request(app.server).get(`/dish/${dishId}`)

    const originalDish = originalDishResponse.body.dish

    const duplicateResponse = await request(app.server)
      .post(`/dish/${dishId}/duplicate`)
      .send();

    expect(duplicateResponse.statusCode).toEqual(201);
    expect(duplicateResponse.body.id).toEqual(expect.any(String));
    expect(duplicateResponse.body.nome).toBe("Pizza Margherita (cópia)");
    expect(duplicateResponse.body.categoria).toBe(CategoriaPrato.LANCHE);
    expect(duplicateResponse.body.createdAt).toEqual(expect.any(String));
    expect(duplicateResponse.body.ingredientes).toHaveLength(2);
    expect(duplicateResponse.body.id).not.toBe(dishId);

    const originalIngredients = originalDish.ingredientes || [];
    const duplicatedIngredients = duplicateResponse.body.ingredientes;

    expect(duplicatedIngredients).toHaveLength(originalIngredients.length);

    duplicatedIngredients.forEach((dupIng: any) => {
      const matchingOriginal = originalIngredients.find(
        (origIng: any) => origIng.nome === dupIng.nome
      );

      expect(matchingOriginal).toBeDefined();
      expect(dupIng.id).not.toBe(matchingOriginal.id);
      expect(dupIng.nome).toBe(matchingOriginal.nome);
      expect(dupIng.quantidade).toBe(matchingOriginal.quantidade);
      expect(dupIng.unidade).toBe(matchingOriginal.unidade);
      expect(dupIng.categoria).toBe(matchingOriginal.categoria);
      expect(dupIng.pratoId).toBe(duplicateResponse.body.id);
    });
  });

  it("should keep original dish unchanged after duplication", async () => {
    const createResponse = await createDish(app)

    const dishId = createResponse.body.id
    const originalName = createResponse.body.nome

    await request(app.server)
      .post(`/dish/${dishId}/ingredient`)
      .send({
        nome: "Farinha de Trigo",
        quantidade: 1,
        unidade: "kg",
        categoria: CategoriaIngrediente.OUTROS,
      })

    await request(app.server)
      .post(`/dish/${dishId}/ingredient`)
      .send({
        nome: "Tomate",
        quantidade: 3,
        unidade: "un",
        categoria: CategoriaIngrediente.HORTIFRUTI,
      })

    await request(app.server)
      .post(`/dish/${dishId}/duplicate`)
      .send();

    const getOriginalResponse = await request(app.server).get(`/dish/${dishId}`);

    const originalDish = getOriginalResponse.body.dish

    expect(originalDish.nome).toBe(originalName);
    expect(originalDish.ingredientes).toHaveLength(2);
  });

  it("should duplicate dish with no ingredients", async () => {
    const createResponse = await createDish(app)

    const dishId = createResponse.body.id

    const duplicateResponse = await request(app.server)
      .post(`/dish/${dishId}/duplicate`)
      .send();

    expect(duplicateResponse.statusCode).toEqual(201);
    expect(duplicateResponse.body.nome).toBe("Pizza Margherita (cópia)");
    expect(duplicateResponse.body.ingredientes).toHaveLength(0);
  });

  it("should not be able when dish does not exist", async () => {
    const response = await request(app.server)
      .post("/dish/550e8400-e29b-41d4-a716-446655440000/duplicate")
      .send();

    expect(response.statusCode).toEqual(404);
    expect(response.body).toEqual({
      message: "Prato não encontrado",
    });
  });
});