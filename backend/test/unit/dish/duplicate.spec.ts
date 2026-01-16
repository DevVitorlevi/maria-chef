import { beforeEach, describe, expect, it } from "vitest";
import type { DishWithIngredients } from "../../../src/repositories/dish-repository";
import { DuplicateDishUseCase } from "../../../src/use-cases/dish/duplicate";
import { InMemoryDishRepository } from "../../in-memory/in-memory-dish-repository";

describe("Duplicate Dish Use Case", () => {
  let dishRepository: InMemoryDishRepository;
  let sut: DuplicateDishUseCase;
  let originalDish: DishWithIngredients;

  beforeEach(async () => {
    dishRepository = new InMemoryDishRepository();
    sut = new DuplicateDishUseCase(dishRepository);

    originalDish = await dishRepository.create({
      nome: "Tapioca de queijo",
      categoria: "CAFE_MANHA",
      ingredientes: {
        create: [
          {
            nome: "Goma de tapioca",
            quantidade: 100,
            unidade: "g",
            categoria: "GRAOS",
          },
          {
            nome: "Queijo coalho",
            quantidade: 50,
            unidade: "g",
            categoria: "LATICINIO",
          },
          {
            nome: "Manteiga",
            quantidade: 10,
            unidade: "g",
            categoria: "LATICINIO",
          },
        ],
      },
    });
  });

  it("should be able to duplicate a dish", async () => {
    const { dish } = await sut.execute({
      dishId: originalDish.id,
    });

    expect(dish.id).not.toBe(originalDish.id);
    expect(dish.nome).toBe("Tapioca de queijo (cópia)");
    expect(dish.categoria).toBe(originalDish.categoria);
    expect(dish.ingredientes).toHaveLength(3);
    expect(dish.createdAt).toBeInstanceOf(Date);
  });

  it("should copy all ingredients with new IDs", async () => {
    const { dish } = await sut.execute({
      dishId: originalDish.id,
    });

    expect(dish.ingredientes).toHaveLength(3);

    dish.ingredientes.forEach((ingrediente: { nome: any; id: any; }) => {
      const originalIngredient = originalDish.ingredientes.find(
        (i: { nome: any; }) => i.nome === ingrediente.nome
      );
      expect(ingrediente.id).not.toBe(originalIngredient?.id);
    });

    expect(dish.ingredientes[0].nome).toBe("Goma de tapioca");
    expect(dish.ingredientes[0].quantidade.toString()).toBe("100");
    expect(dish.ingredientes[0].unidade).toBe("g");
    expect(dish.ingredientes[0].categoria).toBe("GRAOS");

    expect(dish.ingredientes[1].nome).toBe("Queijo coalho");
    expect(dish.ingredientes[1].quantidade.toString()).toBe("50");

    expect(dish.ingredientes[2].nome).toBe("Manteiga");
    expect(dish.ingredientes[2].quantidade.toString()).toBe("10");
  });

  it("should keep original dish unchanged", async () => {
    const originalName = originalDish.nome;
    const originalIngredientsCount = originalDish.ingredientes.length;

    await sut.execute({
      dishId: originalDish.id,
    });

    const unchangedDish = await dishRepository.findById(originalDish.id);

    expect(unchangedDish?.nome).toBe(originalName);
    expect(unchangedDish?.ingredientes).toHaveLength(originalIngredientsCount);
  });

  it("should create independent dishes", async () => {
    const { dish: duplicatedDish } = await sut.execute({
      dishId: originalDish.id,
    });

    await dishRepository.update(duplicatedDish.id, {
      nome: "Tapioca de queijo com coco",
    });

    const originalAfterUpdate = await dishRepository.findById(originalDish.id);
    expect(originalAfterUpdate?.nome).toBe("Tapioca de queijo");
  });

  it("should add (cópia) suffix when duplicating again", async () => {
    const { dish: firstCopy } = await sut.execute({
      dishId: originalDish.id,
    });

    expect(firstCopy.nome).toBe("Tapioca de queijo (cópia)");

    const { dish: secondCopy } = await sut.execute({
      dishId: firstCopy.id,
    });

    expect(secondCopy.nome).toBe("Tapioca de queijo (cópia) (cópia)");
  });

  it("should not be able to duplicate non-existing dish", async () => {
    await expect(() =>
      sut.execute({
        dishId: "550e8400-e29b-41d4-a716-446655440000",
      })
    ).rejects.toThrow("Prato não encontrado");
  });

  it("should not be able to duplicate with invalid UUID", async () => {
    await expect(() =>
      sut.execute({
        dishId: "invalid-uuid",
      })
    ).rejects.toThrow("Prato não encontrado");
  });

  it("should not be able to duplicate with empty ID", async () => {
    await expect(() =>
      sut.execute({
        dishId: "",
      })
    ).rejects.toThrow("Prato não encontrado");
  });

  it("should duplicate dish with many ingredients", async () => {
    const dishWithManyIngredients = await dishRepository.create({
      nome: "Bolo de festa",
      categoria: "SOBREMESA",
      ingredientes: {
        create: Array.from({ length: 15 }, (_, i) => ({
          nome: `Ingrediente ${i + 1}`,
          quantidade: 100,
          unidade: "g",
          categoria: "GRAOS",
        })),
      },
    });

    const { dish } = await sut.execute({
      dishId: dishWithManyIngredients.id,
    });

    expect(dish.ingredientes).toHaveLength(15);
    expect(dish.nome).toBe("Bolo de festa (cópia)");
  });

  it("should duplicate dish with no ingredients", async () => {
    const dishWithoutIngredients = await dishRepository.create({
      nome: "Água",
      categoria: "BEBIDA",
    });

    const { dish } = await sut.execute({
      dishId: dishWithoutIngredients.id,
    });

    expect(dish.ingredientes).toHaveLength(0);
    expect(dish.nome).toBe("Água (cópia)");
  });
});