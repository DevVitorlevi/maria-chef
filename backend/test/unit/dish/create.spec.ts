import { describe, it, expect, beforeEach } from "vitest";
import { CreateDishUseCase } from "../../../src/use-cases/dish/create";
import { CategoriaPrato, CategoriaIngrediente } from "../../../src/generated/prisma/enums";
import { InMemoryDishRepository } from "../../in-memory/in-memory-dish-repository";
describe("Create Dish Use Case", () => {
  let dishRepository: InMemoryDishRepository;
  let sut: CreateDishUseCase;

  beforeEach(() => {
    dishRepository = new InMemoryDishRepository();
    sut = new CreateDishUseCase(dishRepository);
  });

  it("should be able to create a dish with ingredients", async () => {
    const { prato } = await sut.execute({
      nome: "Macarrão à Bolonhesa",
      categoria: CategoriaPrato.ALMOCO,
      ingredientes: [
        {
          nome: "Macarrão",
          quantidade: 500,
          unidade: "g",
          categoria: CategoriaIngrediente.GRAOS,
        },
        {
          nome: "Carne Moída",
          quantidade: 300,
          unidade: "g",
          categoria: CategoriaIngrediente.PROTEINA,
        },
        {
          nome: "Tomate",
          quantidade: 4,
          unidade: "unidades",
          categoria: CategoriaIngrediente.HORTIFRUTI,
        },
      ],
    });

    expect(prato.id).toEqual(expect.any(String));
    expect(prato.nome).toBe("Macarrão à Bolonhesa");
    expect(prato.categoria).toBe(CategoriaPrato.ALMOCO);
    expect(prato.createdAt).toBeInstanceOf(Date);
    expect(prato.ingredientes).toHaveLength(3);
  });

  it("should create a dish without ingredients", async () => {
    const { prato } = await sut.execute({
      nome: "Arroz Branco",
      categoria: CategoriaPrato.ALMOCO,
      ingredientes: [],
    });

    expect(prato.ingredientes).toHaveLength(0);
    expect(dishRepository.database).toHaveLength(1);
    expect(dishRepository.ingredients).toHaveLength(0);
  });

  it("should create breakfast dish", async () => {
    const { prato } = await sut.execute({
      nome: "Panqueca Americana",
      categoria: CategoriaPrato.CAFE_MANHA,
      ingredientes: [
        {
          nome: "Farinha de Trigo",
          quantidade: 200,
          unidade: "g",
          categoria: CategoriaIngrediente.GRAOS,
        },
        {
          nome: "Leite",
          quantidade: 250,
          unidade: "ml",
          categoria: CategoriaIngrediente.LATICINIO,
        },
        {
          nome: "Ovos",
          quantidade: 2,
          unidade: "unidades",
          categoria: CategoriaIngrediente.PROTEINA,
        },
      ],
    });

    expect(prato.categoria).toBe(CategoriaPrato.CAFE_MANHA);
    expect(prato.ingredientes).toHaveLength(3);
  });

  it("should create dessert dish", async () => {
    const { prato } = await sut.execute({
      nome: "Mousse de Chocolate",
      categoria: CategoriaPrato.SOBREMESA,
      ingredientes: [
        {
          nome: "Chocolate ao Leite",
          quantidade: 200,
          unidade: "g",
          categoria: CategoriaIngrediente.OUTROS,
        },
        {
          nome: "Creme de Leite",
          quantidade: 200,
          unidade: "ml",
          categoria: CategoriaIngrediente.LATICINIO,
        },
      ],
    });

    expect(prato.categoria).toBe(CategoriaPrato.SOBREMESA);
    expect(prato.nome).toBe("Mousse de Chocolate");
  });

  it("should link ingredients to the created dish", async () => {
    const { prato } = await sut.execute({
      nome: "Sopa de Legumes",
      categoria: CategoriaPrato.JANTAR,
      ingredientes: [
        {
          nome: "Cenoura",
          quantidade: 2,
          unidade: "unidades",
          categoria: CategoriaIngrediente.HORTIFRUTI,
        },
        {
          nome: "Batata",
          quantidade: 3,
          unidade: "unidades",
          categoria: CategoriaIngrediente.HORTIFRUTI,
        },
      ],
    });

    const savedIngredients = dishRepository.ingredients.filter(
      (ing) => ing.pratoId === prato.id
    );

    expect(savedIngredients).toHaveLength(2);
    expect(savedIngredients[0].pratoId).toBe(prato.id);
    expect(savedIngredients[1].pratoId).toBe(prato.id);
  });

  it("should store ingredient quantities", async () => {
    await sut.execute({
      nome: "Café Expresso",
      categoria: CategoriaPrato.CAFE_MANHA,
      ingredientes: [
        {
          nome: "Café em Pó",
          quantidade: 7.5,
          unidade: "g",
          categoria: CategoriaIngrediente.BEBIDA,
        },
      ],
    });

    const ingredient = dishRepository.ingredients[0];

    expect(ingredient.quantidade).toBeDefined();
    expect(ingredient.quantidade.toString()).toBe("7.5");
  });
})