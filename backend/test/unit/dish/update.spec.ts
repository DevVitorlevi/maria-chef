import { beforeEach, describe, expect, it } from "vitest";
import { CategoriaIngrediente, CategoriaPrato } from "../../../src/generated/prisma/enums";
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
      ingredientes: {
        create: [
          {
            nome: "Feijão",
            quantidade: 300,
            unidade: "g",
            categoria: CategoriaIngrediente.GRAOS,
          },
        ],
      },
    });

    const result = await sut.execute({
      id: createdDish.id,
      nome: "Feijoada Completa",
      categoria: CategoriaPrato.ALMOCO,
      ingredientes: [
        {
          nome: "Feijão preto",
          quantidade: 500,
          unidade: "g",
          categoria: CategoriaIngrediente.GRAOS,
        },
        {
          nome: "Carne seca",
          quantidade: 300,
          unidade: "g",
          categoria: CategoriaIngrediente.PROTEINA,
        },
      ],
    });

    expect(result.prato.id).toEqual(createdDish.id);
    expect(result.prato.nome).toEqual("Feijoada Completa");
    expect(result.prato.categoria).toEqual(CategoriaPrato.ALMOCO);
    expect(result.prato.ingredientes).toHaveLength(2);
    expect(result.prato.ingredientes[0].nome).toEqual("Feijão preto");
    expect(result.prato.ingredientes[1].nome).toEqual("Carne seca");
  });

  it("should not be able to update a dish", async () => {
    await expect(() =>
      sut.execute({
        id: "prato-inexistente",
        nome: "Prato que não existe",
        categoria: CategoriaPrato.ALMOCO,
        ingredientes: [
          {
            nome: "Ingrediente",
            quantidade: 100,
            unidade: "g",
            categoria: CategoriaIngrediente.TEMPERO,
          },
        ],
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it("should delete all old ingredients and create new ones", async () => {
    const createdDish = await dishRepository.create({
      nome: "Salada Caesar",
      categoria: CategoriaPrato.LANCHE,
      ingredientes: {
        create: [
          {
            nome: "Alface velha",
            quantidade: 100,
            unidade: "g",
            categoria: CategoriaIngrediente.HORTIFRUTI,
          },
          {
            nome: "Tomate velho",
            quantidade: 50,
            unidade: "g",
            categoria: CategoriaIngrediente.HORTIFRUTI,
          },
        ],
      },
    });

    const result = await sut.execute({
      id: createdDish.id,
      nome: "Salada Caesar",
      categoria: CategoriaPrato.LANCHE,
      ingredientes: [
        {
          nome: "Alface romana",
          quantidade: 200,
          unidade: "g",
          categoria: CategoriaIngrediente.HORTIFRUTI,
        },
      ],
    });

    expect(result.prato.ingredientes).toHaveLength(1);
    expect(result.prato.ingredientes[0].nome).toEqual("Alface romana");
    expect(result.prato.ingredientes[0].quantidade.toString()).toEqual("200");
  });

  it("should be able to update a dish without ingredients", async () => {
    const createdDish = await dishRepository.create({
      nome: "Água com gás",
      categoria: CategoriaPrato.SOBREMESA,
      ingredientes: {
        create: [
          {
            nome: "Ingrediente a remover",
            quantidade: 100,
            unidade: "ml",
            categoria: CategoriaIngrediente.BEBIDA,
          },
        ],
      },
    });

    const result = await sut.execute({
      id: createdDish.id,
      nome: "Água mineral",
      categoria: CategoriaPrato.SOBREMESA,
      ingredientes: [],
    });

    expect(result.prato.nome).toEqual("Água mineral");
    expect(result.prato.ingredientes).toHaveLength(0);
  });

  it("should update dish name and category", async () => {
    const createdDish = await dishRepository.create({
      nome: "Nome Antigo",
      categoria: CategoriaPrato.ALMOCO,
      ingredientes: {
        create: [],
      },
    });

    const result = await sut.execute({
      id: createdDish.id,
      nome: "Nome Novo",
      categoria: CategoriaPrato.SOBREMESA,
      ingredientes: [],
    });

    expect(result.prato.nome).toEqual("Nome Novo");
    expect(result.prato.categoria).toEqual(CategoriaPrato.SOBREMESA);
  });
});