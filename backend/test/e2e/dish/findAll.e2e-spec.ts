import request from "supertest";
import { describe, it, beforeAll, afterAll, beforeEach, expect } from "vitest";

import { app } from "@/app";
import { prisma } from "@/lib/prisma";
import { CategoriaPrato } from "@/generated/prisma/enums";
import { resetDatabase } from "test/utils/reset-database";
import { createDish } from "test/utils/create-dish";

describe("Find All Dishes (E2E)", () => {
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

  it("should be able to list all dishes", async () => {
    await createDish(app);
    await createDish(app, {
      nome: "Feijoada",
      categoria: CategoriaPrato.ALMOCO,
    });

    const response = await request(app.server).get("/dish").send();

    expect(response.status).toBe(200);
    expect(response.body.pratos).toHaveLength(2);
    expect(response.body.pratos).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          nome: "Pizza Margherita",
          categoria: CategoriaPrato.LANCHE,
        }),
        expect.objectContaining({
          id: expect.any(String),
          nome: "Feijoada",
          categoria: CategoriaPrato.ALMOCO,
        }),
      ])
    );
  });

  it("should be able to filter dishes by name", async () => {
    await createDish(app, { nome: "Pizza Margherita" });
    await createDish(app, { nome: "Feijoada" });
    await createDish(app, { nome: "Pizza Calabresa" });

    const response = await request(app.server)
      .get("/dish")
      .query({ nome: "pizza" })
      .send();

    expect(response.status).toBe(200);
    expect(response.body.pratos).toHaveLength(2);
    expect(response.body.pratos).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ nome: "Pizza Margherita" }),
        expect.objectContaining({ nome: "Pizza Calabresa" }),
      ])
    );
  });

  it("should be able to filter dishes by category", async () => {
    await createDish(app, {
      nome: "Pizza",
      categoria: CategoriaPrato.LANCHE,
    });
    await createDish(app, {
      nome: "Feijoada",
      categoria: CategoriaPrato.ALMOCO,
    });
    await createDish(app, {
      nome: "Hamburguer",
      categoria: CategoriaPrato.LANCHE,
    });

    const response = await request(app.server)
      .get("/dish")
      .query({ categoria: CategoriaPrato.LANCHE })
      .send();

    expect(response.status).toBe(200);
    expect(response.body.pratos).toHaveLength(2);
    expect(response.body.pratos).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          nome: "Pizza",
          categoria: CategoriaPrato.LANCHE,
        }),
        expect.objectContaining({
          nome: "Hamburguer",
          categoria: CategoriaPrato.LANCHE,
        }),
      ])
    );
  });

  it("should be able to filter dishes by name and category", async () => {
    await createDish(app, {
      nome: "Pizza Margherita",
      categoria: CategoriaPrato.LANCHE,
    });
    await createDish(app, {
      nome: "Pizza de Feijoada",
      categoria: CategoriaPrato.ALMOCO,
    });
    await createDish(app, {
      nome: "Feijoada",
      categoria: CategoriaPrato.ALMOCO,
    });

    const response = await request(app.server)
      .get("/dish")
      .query({
        nome: "pizza",
        categoria: CategoriaPrato.ALMOCO,
      })
      .send();

    expect(response.status).toBe(200);
    expect(response.body.pratos).toHaveLength(1);
    expect(response.body.pratos[0]).toEqual(
      expect.objectContaining({
        nome: "Pizza de Feijoada",
        categoria: CategoriaPrato.ALMOCO,
      })
    );
  });

  it("should return empty array when no dishes match filters", async () => {
    await createDish(app, {
      nome: "Pizza",
      categoria: CategoriaPrato.LANCHE,
    });

    const response = await request(app.server)
      .get("/dish")
      .query({ nome: "inexistente" })
      .send();

    expect(response.status).toBe(200);
    expect(response.body.pratos).toHaveLength(0);
  });

  it("should return empty array when there are no dishes", async () => {
    const response = await request(app.server).get("/dish").send();

    expect(response.status).toBe(200);
    expect(response.body.pratos).toHaveLength(0);
  });
});