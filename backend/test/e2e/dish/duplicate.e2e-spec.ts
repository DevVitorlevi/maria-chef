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
    const createResponse = await createDish(app, {
      nome: "Tapioca de queijo",
      categoria: CategoriaPrato.CAFE_MANHA,
      ingredientes: [
        {
          nome: "Goma de tapioca",
          quantidade: 100,
          unidade: "g",
          categoria: CategoriaIngrediente.GRAOS,
        },
        {
          nome: "Queijo coalho",
          quantidade: 50,
          unidade: "g",
          categoria: CategoriaIngrediente.LATICINIO,
        },
        {
          nome: "Manteiga",
          quantidade: 10,
          unidade: "g",
          categoria: CategoriaIngrediente.LATICINIO,
        },
      ],
    });

    const originalDishId = createResponse.body.id;

    const duplicateResponse = await request(app.server)
      .post(`/dish/${originalDishId}/duplicate`)
      .send();

    expect(duplicateResponse.statusCode).toEqual(201);
    expect(duplicateResponse.body.id).toEqual(expect.any(String));
    expect(duplicateResponse.body.nome).toBe("Tapioca de queijo (cópia)");
    expect(duplicateResponse.body.categoria).toBe(CategoriaPrato.CAFE_MANHA);
    expect(duplicateResponse.body.createdAt).toEqual(expect.any(String));
    expect(duplicateResponse.body.ingredientes).toHaveLength(3);
    expect(duplicateResponse.body.id).not.toBe(originalDishId);

    const originalIngredients = createResponse.body.ingredientes;
    const duplicatedIngredients = duplicateResponse.body.ingredientes;

    duplicatedIngredients.forEach((dupIng: any, index: number) => {
      expect(dupIng.id).not.toBe(originalIngredients[index].id);
      expect(dupIng.nome).toBe(originalIngredients[index].nome);
      expect(dupIng.quantidade).toBe(originalIngredients[index].quantidade);
      expect(dupIng.unidade).toBe(originalIngredients[index].unidade);
      expect(dupIng.categoria).toBe(originalIngredients[index].categoria);
      expect(dupIng.pratoId).toBe(duplicateResponse.body.id);
    });
  });

  it("should keep original dish unchanged after duplication", async () => {
    const createResponse = await createDish(app, {
      nome: "Suco de laranja",
      categoria: CategoriaPrato.LANCHE,
      ingredientes: [
        {
          nome: "Laranja",
          quantidade: 300,
          unidade: "g",
          categoria: CategoriaIngrediente.HORTIFRUTI,
        },
      ],
    });

    const originalDishId = createResponse.body.id;
    const originalName = createResponse.body.nome;

    await request(app.server)
      .post(`/dish/${originalDishId}/duplicate`)
      .send();

    const getOriginalResponse = await request(app.server).get(
      `/dish/${originalDishId}`
    );

    expect(getOriginalResponse.statusCode).toEqual(200);
    expect(getOriginalResponse.body.prato.nome).toBe(originalName);
    expect(getOriginalResponse.body.prato.ingredientes).toHaveLength(1);
  });


  it("should return 404 when dish does not exist", async () => {
    const response = await request(app.server)
      .post("/dish/550e8400-e29b-41d4-a716-446655440000/duplicate")
      .send();

    expect(response.statusCode).toEqual(404);
    expect(response.body).toEqual({
      message: "Prato não encontrado",
    });
  });
});