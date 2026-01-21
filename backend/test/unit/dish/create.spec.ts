import { describe, it, expect, beforeEach } from "vitest";
import { CreateDishUseCase } from "../../../src/use-cases/dish/create";
import { CategoriaPrato } from "../../../src/generated/prisma/enums";
import { InMemoryDishRepository } from "../../in-memory/in-memory-dish-repository";
describe("Create Dish Use Case", () => {
  let dishRepository: InMemoryDishRepository;
  let sut: CreateDishUseCase;

  beforeEach(() => {
    dishRepository = new InMemoryDishRepository();
    sut = new CreateDishUseCase(dishRepository);
  });

  it("should be able to create a dish", async () => {
    const { dish } = await sut.execute({
      nome: "Macarrão à Bolonhesa",
      categoria: CategoriaPrato.ALMOCO,
    });

    expect(dish.id).toEqual(expect.any(String));
    expect(dish.nome).toBe("Macarrão à Bolonhesa");
    expect(dish.categoria).toBe(CategoriaPrato.ALMOCO);
  });

  it("should create breakfast dish", async () => {
    const { dish } = await sut.execute({
      nome: "Panqueca Americana",
      categoria: CategoriaPrato.CAFE_MANHA,
    });

    expect(dish.categoria).toBe(CategoriaPrato.CAFE_MANHA);
  });


  it("should create dinner dish", async () => {
    const { dish } = await sut.execute({
      nome: "Lasanha",
      categoria: CategoriaPrato.JANTAR,
    });

    expect(dish.categoria).toBe(CategoriaPrato.JANTAR);
  });

  it("should create snack dish", async () => {
    const { dish } = await sut.execute({
      nome: "Panqueca Americana",
      categoria: CategoriaPrato.LANCHE,
    });

    expect(dish.categoria).toBe(CategoriaPrato.LANCHE);
  });

  it("should create dessert dish", async () => {
    const { dish } = await sut.execute({
      nome: "Mousse de Chocolate",
      categoria: CategoriaPrato.SOBREMESA,
    });

    expect(dish.categoria).toBe(CategoriaPrato.SOBREMESA);
    expect(dish.nome).toBe("Mousse de Chocolate");
  });
})