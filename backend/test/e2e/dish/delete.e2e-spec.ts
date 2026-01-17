import { app } from "@/app";
import { prisma } from "@/lib/prisma";
import request from "supertest";
import { createDish } from "test/utils/create-dish";
import { resetDatabase } from "test/utils/reset-database";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";

describe("Delete Dish (E2E)", () => {
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

  it("should be able to delete a dish and yours all ingredients", async () => {
    const createdDish = await createDish(app)

    const response = await request(app.server).delete(`/dish/${createdDish.body.id}/delete`).send()

    expect(response.statusCode).toEqual(204)
  })
});
