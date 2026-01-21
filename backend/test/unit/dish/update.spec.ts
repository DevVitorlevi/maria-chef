import { beforeEach, describe, expect, it } from "vitest";
import { CategoriaPrato } from "../../../src/generated/prisma/enums";
import { InMemoryDishRepository } from "../../in-memory/in-memory-dish-repository";
import { UpdateDishUseCase } from "../../../src/use-cases/dish/update";
import { ResourceNotFoundError } from "../../../src/utils/errors/resource-not-found-error";

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
      categoria: CategoriaPrato.ALMOCO,
    });

    expect(result.prato.id).toEqual(createdDish.id);
    expect(result.prato.nome).toEqual("Feijoada Completa");
    expect(result.prato.categoria).toEqual(CategoriaPrato.ALMOCO);
  });

  it("should not be able to update a dish", async () => {
    await expect(() =>
      sut.execute("prato-inexistente", {
        nome: "Prato que não existe",
        categoria: CategoriaPrato.ALMOCO,
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

    expect(result.prato.nome).toEqual("Nome Novo");
    expect(result.prato.categoria).toEqual(CategoriaPrato.SOBREMESA);
  });
});