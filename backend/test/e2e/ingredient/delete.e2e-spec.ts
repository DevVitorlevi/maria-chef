import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createDish } from "../../utils/create-dish";
import { setupE2E } from '../../utils/setup-e2e';
describe("Delete Ingredient (E2E)", () => {
  let app: Awaited<ReturnType<typeof setupE2E>>

  beforeEach(async () => {
    app = await setupE2E()
  })


  it("should be able delete an ingredient for an existing dish", async () => {
    const createdDish = await createDish(app)

    const response = await request(app.server)
      .delete(`/dish/${createdDish.body.id}/ingredient/${createdDish.body.ingredientes[1].id}/delete`)
      .send()

    expect(response.statusCode).toBe(204)
  })

  it("should not be able delete an dish does not exist", async () => {
    const nonExistingDishId = crypto.randomUUID()

    const response = await request(app.server)
      .delete(`/dish/${nonExistingDishId}/ingredient/${nonExistingDishId}/delete`)
      .send()


    expect(response.statusCode).toBe(400)

    expect(response.body).toEqual({
      message: expect.any(String),
    })
  })
})
