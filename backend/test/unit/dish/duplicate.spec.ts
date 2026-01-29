import { beforeEach, describe, expect, it } from "vitest";
import type { Ingrediente } from "../../../src/generated/prisma/client";
import { CategoriaIngrediente, CategoriaPrato } from "../../../src/generated/prisma/enums";
import type { DishWithIngredients } from "../../../src/repositories/dish-repository";
import { DuplicateDishUseCase } from "../../../src/use-cases/dish/duplicate";
import { InMemoryDishRepository } from "../../in-memory/in-memory-dish-repository";
import { InMemoryIngredientRepository } from "../../in-memory/in-memory-ingredient-repository";

describe("Duplicate Dish Use Case", () => {
  let dishRepository: InMemoryDishRepository;
  let ingredientRepository: InMemoryIngredientRepository;
  let sut: DuplicateDishUseCase;
  let originalDish: DishWithIngredients;

  beforeEach(async () => {
    1
    const sharedIngredients: Ingrediente[] = [];

    dishRepository = new InMemoryDishRepository(sharedIngredients);
    ingredientRepository = new InMemoryIngredientRepository(sharedIngredients);
    sut = new DuplicateDishUseCase(dishRepository);

    originalDish = await dishRepository.create({
      nome: "Tapioca de queijo",
      categoria: CategoriaPrato.CAFE_MANHA,
    });

    const originalDishId = originalDish.id;

    await Promise.all([
      ingredientRepository.create(originalDishId, {
        nome: "Goma de Tapioca",
        quantidade: 200,
        unidade: "g",
        categoria: CategoriaIngrediente.OUTROS,
      }),
      ingredientRepository.create(originalDishId, {
        nome: "Queijo",
        quantidade: 100,
        unidade: "g",
        categoria: CategoriaIngrediente.LATICINIO,
      })
    ])

  });

  it("should be able to duplicate a dish", async () => {
    const { dish } = await sut.execute({
      dishId: originalDish.id,
    });

    expect(dish.id).not.toBe(originalDish.id);
    expect(dish.nome).toBe("Tapioca de queijo (cópia)");
    expect(dish.categoria).toBe(originalDish.categoria);
    expect(dish.ingredientes).toHaveLength(2);
    expect(dish.createdAt).toBeInstanceOf(Date);
  });

  it("should copy all ingredients with new IDs", async () => {
    const originalDishWithIngredients = await dishRepository.findById({ dishId: originalDish.id });

    const { dish } = await sut.execute({
      dishId: originalDish.id,
    });

    expect(dish.ingredientes).toHaveLength(2);

    dish.ingredientes.forEach((ingrediente: any) => {
      const originalIngredient = originalDishWithIngredients?.ingredientes.find(
        (i: any) => i.nome === ingrediente.nome
      );
      expect(ingrediente.id).not.toBe(originalIngredient?.id);
    });

    const gomaIngredient = dish.ingredientes.find((i: any) => i.nome === "Goma de Tapioca");
    expect(gomaIngredient).toBeDefined();
    expect(gomaIngredient?.quantidade.toString()).toBe("200");
    expect(gomaIngredient?.unidade).toBe("g");
    expect(gomaIngredient?.categoria).toBe(CategoriaIngrediente.OUTROS);

    const queijoIngredient = dish.ingredientes.find((i: any) => i.nome === "Queijo");
    expect(queijoIngredient).toBeDefined();
    expect(queijoIngredient?.quantidade.toString()).toBe("100");
    expect(queijoIngredient?.unidade).toBe("g");
    expect(queijoIngredient?.categoria).toBe(CategoriaIngrediente.LATICINIO);
  });

  it("should keep original dish unchanged", async () => {
    const originalName = originalDish.nome;
    const originalIngredientsCount = 2;

    await sut.execute({
      dishId: originalDish.id,
    });

    const unchangedDish = await dishRepository.findById({ dishId: originalDish.id });

    expect(unchangedDish?.nome).toBe(originalName);
    expect(unchangedDish?.ingredientes).toHaveLength(originalIngredientsCount);
  });

  it("should create independent dishes", async () => {
    const { dish: duplicatedDish } = await sut.execute({
      dishId: originalDish.id,
    });

    await dishRepository.update(duplicatedDish.id, {
      nome: "Tapioca de queijo com coco",
      categoria: duplicatedDish.categoria,
    });

    const originalAfterUpdate = await dishRepository.findById({ dishId: originalDish.id });
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

  it("should duplicate dish with many ingredients", async () => {
    const dishWithManyIngredients = await dishRepository.create({
      nome: "Bolo de festa",
      categoria: CategoriaPrato.SOBREMESA,
    });

    for (let i = 0; i < 15; i++) {
      await ingredientRepository.create(dishWithManyIngredients.id, {
        nome: `Ingrediente ${i + 1}`,
        quantidade: 100,
        unidade: "g",
        categoria: CategoriaIngrediente.GRAOS,
      });
    }

    const { dish } = await sut.execute({
      dishId: dishWithManyIngredients.id,
    });

    expect(dish.ingredientes).toHaveLength(15);
    expect(dish.nome).toBe("Bolo de festa (cópia)");
  });

  it("should duplicate dish with no ingredients", async () => {
    const dishWithoutIngredients = await dishRepository.create({
      nome: "Água",
      categoria: CategoriaPrato.LANCHE,
    });

    const { dish } = await sut.execute({
      dishId: dishWithoutIngredients.id,
    });

    expect(dish.ingredientes).toHaveLength(0);
    expect(dish.nome).toBe("Água (cópia)");
  })
});