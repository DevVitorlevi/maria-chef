import { beforeEach, describe, expect, it } from "vitest";
import { CategoriaPrato } from "../../../src/generated/prisma/enums";
import { UpdateDishUseCase } from "../../../src/use-cases/dish/update";
import { ResourceNotFoundError } from "../../../src/utils/errors/resource-not-found-error";
import { InMemoryDishRepository } from "../../in-memory/in-memory-dish-repository";

describe("UpdateDishUseCase", () => {
  let dishRepository: InMemoryDishRepository;
  let sut: UpdateDishUseCase;

  beforeEach(() => {
    dishRepository = new InMemoryDishRepository();
    sut = new UpdateDishUseCase(dishRepository);
  });

  it("should be able to update a dish successfully", async () => {
    const createdDish = await dishRepository.create({
      nome: "Feijoada Antiga",
      categoria: CategoriaPrato.ALMOCO,
    });

    const result = await sut.execute(createdDish.id, {
      nome: "Feijoada Completa",
    });

    expect(result.id).toEqual(createdDish.id);
    expect(result.nome).toEqual("Feijoada Completa");
    expect(result.categoria).toEqual(CategoriaPrato.ALMOCO);
    expect(result.ingredientes).toBeDefined();
  });

  it("should not be able to update a non-existent dish", async () => {
    await expect(() =>
      sut.execute("prato-inexistente", {
        nome: "Prato que não existe",
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it("should update dish name and category", async () => {
    const createdDish = await dishRepository.create({
      nome: "Nome Antigo",
      categoria: CategoriaPrato.ALMOCO,
    });

    const result = await sut.execute(createdDish.id, {
      nome: "Nome Novo",
      categoria: CategoriaPrato.SOBREMESA,
    });

    expect(result.nome).toEqual("Nome Novo");
    expect(result.categoria).toEqual(CategoriaPrato.SOBREMESA);
  });

  it("should update only dish name", async () => {
    const createdDish = await dishRepository.create({
      nome: "Nome Antigo",
      categoria: CategoriaPrato.ALMOCO,
    });

    const result = await sut.execute(createdDish.id, {
      nome: "Nome Novo",
    });

    expect(result.nome).toEqual("Nome Novo");
    expect(result.categoria).toEqual(CategoriaPrato.ALMOCO);
  });

  it("should update only dish category", async () => {
    const createdDish = await dishRepository.create({
      nome: "Feijoada",
      categoria: CategoriaPrato.ALMOCO,
    });

    const result = await sut.execute(createdDish.id, {
      categoria: CategoriaPrato.JANTAR,
    });

    expect(result.nome).toEqual("Feijoada");
    expect(result.categoria).toEqual(CategoriaPrato.JANTAR);
  });
});