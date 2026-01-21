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

    expect(updateResponse.statusCode).toEqual(204);
  });

  it("should not be able update an dish does not exist", async () => {
    const response = await request(app.server)
      .put("/dish/non-existent-id")
      .send({
        nome: "Prato Inexistente",
        categoria: CategoriaPrato.ALMOCO,
      });

    expect(response.statusCode).toEqual(400);
  });
});