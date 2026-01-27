import { CategoriaPrato } from "@/generated/prisma/enums";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createDish } from "../../utils/create-dish";
import { setupE2E } from '../../utils/setup-e2e';

describe("Update Dish (e2e)", () => {
  let app: Awaited<ReturnType<typeof setupE2E>>

  beforeEach(async () => {
    app = await setupE2E()
  })

  it("should be able to update a dish", async () => {
    const createResponse = await createDish(app, {
      nome: "Feijoada Antiga",
      categoria: CategoriaPrato.ALMOCO,
    });

    const dishId = createResponse.body.id

    const updateResponse = await request(app.server)
      .put(`/dish/${dishId}`)
      .send({
        nome: "Feijoada Completa",
        categoria: CategoriaPrato.ALMOCO,
      });


    console.log(updateResponse.body)
    expect(updateResponse.statusCode).toEqual(200);
    expect(updateResponse.body.dish).toBeDefined();
    expect(updateResponse.body.dish.id).toEqual(dishId);
    expect(updateResponse.body.dish.nome).toEqual("Feijoada Completa");
    expect(updateResponse.body.dish.categoria).toEqual(CategoriaPrato.ALMOCO);
    expect(updateResponse.body.dish.ingredientes).toBeDefined();
  });

  it("should be able to update just 'nome'", async () => {
    const createResponse = await createDish(app, {
      nome: "Feijoada Antiga",
      categoria: CategoriaPrato.ALMOCO,
    });

    const dishId = createResponse.body.id

    const updateResponse = await request(app.server)
      .put(`/dish/${dishId}`)
      .send({
        nome: "Feijoada Completa",
      });

    expect(updateResponse.statusCode).toEqual(200);
    expect(updateResponse.body.dish.nome).toEqual("Feijoada Completa");
    expect(updateResponse.body.dish.categoria).toEqual(CategoriaPrato.ALMOCO);
  })

  it("should be able to update just 'categoria'", async () => {
    const createResponse = await createDish(app, {
      nome: "Feijoada",
      categoria: CategoriaPrato.ALMOCO,
    });

    const dishId = createResponse.body.id

    const updateResponse = await request(app.server)
      .put(`/dish/${dishId}`)
      .send({
        categoria: CategoriaPrato.JANTAR,
      });

    expect(updateResponse.statusCode).toEqual(200);
    expect(updateResponse.body.dish.nome).toEqual("Feijoada");
    expect(updateResponse.body.dish.categoria).toEqual(CategoriaPrato.JANTAR);
  })

  it("should not be able to update a dish that does not exist", async () => {
    const response = await request(app.server)
      .put("/dish/non-existent-id")
      .send({
        nome: "Prato Inexistente",
        categoria: CategoriaPrato.ALMOCO,
      });

    expect(response.statusCode).toEqual(404);
    expect(response.body.message).toBeDefined();
  });
});