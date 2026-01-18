import request from "supertest";
import { createDish } from "test/utils/create-dish";
import { beforeEach, describe, it } from "vitest";
import { setupE2E } from '../../utils/setup-e2e';

describe("Delete Dish (E2E)", () => {
  let app: Awaited<ReturnType<typeof setupE2E>>

  beforeEach(async () => {
    app = await setupE2E()
  })

  it("should be able to delete a dish and yours all ingredients", async () => {
    const createdDish = await createDish(app)

    const response = await request(app.server).delete(`/dish/${createdDish.body.id}/delete`).send()

    expect(response.statusCode).toEqual(204)
  })
});
