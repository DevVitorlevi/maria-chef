import { beforeEach, describe, expect, it } from "vitest";
import { CategoriaIngrediente, CategoriaPrato, TipoRefeicao } from "../../../src/generated/prisma/enums";
import { UpdateMealUseCase } from "../../../src/use-cases/meal/update";
import { InMemoryDishRepository } from "../../in-memory/in-memory-dish-repository";
import { InMemoryIngredientRepository } from "../../in-memory/in-memory-ingredient-repository";
import { InMemoryMealRepository } from "../../in-memory/in-memory-meal-repository";
import { InMemoryMenuRepository } from "../../in-memory/in-memory-menu-repository";
import { ResourceNotFoundError } from "../../../src/utils/errors/resource-not-found-error";

describe("Update Meal Use Case", () => {
  let menuRepository: InMemoryMenuRepository
  let mealRepository: InMemoryMealRepository
  let ingredientRepository: InMemoryIngredientRepository
  let dishRepository: InMemoryDishRepository
  let sut: UpdateMealUseCase

  beforeEach(() => {
    dishRepository = new InMemoryDishRepository()
    ingredientRepository = new InMemoryIngredientRepository()
    menuRepository = new InMemoryMenuRepository()
    mealRepository = new InMemoryMealRepository(dishRepository)

    sut = new UpdateMealUseCase(mealRepository, menuRepository)
  })

  it("should be able to update meal date and type", async () => {
    const [dish1, dish2] = await Promise.all([
      dishRepository.create({
        nome: "Macarrão à Bolonhesa",
        categoria: CategoriaPrato.ALMOCO,
      }),
      dishRepository.create({
        nome: "Arroz Doce",
        categoria: CategoriaPrato.SOBREMESA,
      })
    ])

    await Promise.all([
      ingredientRepository.create(dish1.id, {
        nome: "Macarrão",
        quantidade: 400,
        unidade: "g",
        categoria: CategoriaIngrediente.OUTROS
      }),
      ingredientRepository.create(dish1.id, {
        nome: "Molho de Tomate",
        quantidade: 200,
        unidade: "g",
        categoria: CategoriaIngrediente.TEMPERO
      })
    ])

    await Promise.all([
      ingredientRepository.create(dish2.id, {
        nome: "Arroz",
        quantidade: 400,
        unidade: "g",
        categoria: CategoriaIngrediente.OUTROS
      }),
      ingredientRepository.create(dish2.id, {
        nome: "Leite Condensado",
        quantidade: 200,
        unidade: "g",
        categoria: CategoriaIngrediente.TEMPERO
      })
    ])

    const menuMaria = await menuRepository.create({
      title: "Cardapio Maria",
      checkIn: new Date("2026-02-10"),
      checkOut: new Date("2026-02-25"),
      adults: 2,
      kids: 1,
      restricoes: ["sem lactose"],
      preferencias: "Prefere comidas leves"
    })

    const lunch = await mealRepository.create({
      menuId: menuMaria.id,
      date: new Date("2026-02-02"),
      type: TipoRefeicao.ALMOCO,
      dishes: [dish1.id, dish2.id]
    })

    const response = await sut.execute(
      { mealId: lunch.id, menuId: menuMaria.id },
      {
        date: new Date("2026-02-04"),
        type: TipoRefeicao.CAFE
      }
    )

    expect(response.meal.id).toBe(lunch.id)
    expect(response.meal.data).toEqual(new Date("2026-02-04"))
    expect(response.meal.tipo).toBe(TipoRefeicao.CAFE)
    expect(response.meal.pratos).toHaveLength(2)
  })

  it("should be able to remove dishes from meal", async () => {
    const [dish1, dish2, dish3] = await Promise.all([
      dishRepository.create({
        nome: "Macarrão à Bolonhesa",
        categoria: CategoriaPrato.ALMOCO,
      }),
      dishRepository.create({
        nome: "Arroz Doce",
        categoria: CategoriaPrato.SOBREMESA,
      }),
      dishRepository.create({
        nome: "Salada Caesar",
        categoria: CategoriaPrato.ALMOCO,
      })
    ])

    const menuMaria = await menuRepository.create({
      title: "Cardapio Maria",
      checkIn: new Date("2026-02-10"),
      checkOut: new Date("2026-02-25"),
      adults: 2,
      kids: 1,
      restricoes: ["sem lactose"],
      preferencias: "Prefere comidas leves"
    })

    const lunch = await mealRepository.create({
      menuId: menuMaria.id,
      date: new Date("2026-02-02"),
      type: TipoRefeicao.ALMOCO,
      dishes: [dish1.id, dish2.id, dish3.id]
    })

    const response = await sut.execute(
      { mealId: lunch.id, menuId: menuMaria.id },
      {
        dishes: [dish1.id, dish3.id]
      }
    )

    expect(response.meal.pratos).toHaveLength(2)
    expect(response.meal.pratos.map((p: { id: any; }) => p.id)).toEqual([dish1.id, dish3.id])
    expect(response.meal.pratos.map((p: { id: any; }) => p.id)).not.toContain(dish2.id)
  })

  it("should be able to add new dishes to meal", async () => {
    const [dish1, dish2, dish3] = await Promise.all([
      dishRepository.create({
        nome: "Macarrão à Bolonhesa",
        categoria: CategoriaPrato.ALMOCO,
      }),
      dishRepository.create({
        nome: "Arroz Doce",
        categoria: CategoriaPrato.SOBREMESA,
      }),
      dishRepository.create({
        nome: "Salada Caesar",
        categoria: CategoriaPrato.ALMOCO,
      })
    ])

    const menuMaria = await menuRepository.create({
      title: "Cardapio Maria",
      checkIn: new Date("2026-02-10"),
      checkOut: new Date("2026-02-25"),
      adults: 2,
      kids: 1,
      restricoes: ["sem lactose"],
      preferencias: "Prefere comidas leves"
    })

    const lunch = await mealRepository.create({
      menuId: menuMaria.id,
      date: new Date("2026-02-02"),
      type: TipoRefeicao.ALMOCO,
      dishes: [dish1.id]
    })

    const response = await sut.execute(
      { mealId: lunch.id, menuId: menuMaria.id },
      {
        dishes: [dish1.id, dish2.id, dish3.id]
      }
    )

    expect(response.meal.pratos).toHaveLength(3)
    expect(response.meal.pratos.map((p: { id: any; }) => p.id)).toEqual([dish1.id, dish2.id, dish3.id])
  })

  it("should not be able to update meal with non-existent menu", async () => {
    const dish1 = await dishRepository.create({
      nome: "Macarrão à Bolonhesa",
      categoria: CategoriaPrato.ALMOCO,
    })

    const menuMaria = await menuRepository.create({
      title: "Cardapio Maria",
      checkIn: new Date("2026-02-10"),
      checkOut: new Date("2026-02-25"),
      adults: 2,
      kids: 1,
      restricoes: ["sem lactose"],
      preferencias: "Prefere comidas leves"
    })

    const lunch = await mealRepository.create({
      menuId: menuMaria.id,
      date: new Date("2026-02-02"),
      type: TipoRefeicao.ALMOCO,
      dishes: [dish1.id]
    })

    await expect(() =>
      sut.execute(
        { mealId: lunch.id, menuId: "non-existent-menu-id" },
        { type: TipoRefeicao.CAFE }
      )
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it("should not be able to update non-existent meal", async () => {
    const menuMaria = await menuRepository.create({
      title: "Cardapio Maria",
      checkIn: new Date("2026-02-10"),
      checkOut: new Date("2026-02-25"),
      adults: 2,
      kids: 1,
      restricoes: ["sem lactose"],
      preferencias: "Prefere comidas leves"
    })

    await expect(() =>
      sut.execute(
        { mealId: "non-existent-meal-id", menuId: menuMaria.id },
        { type: TipoRefeicao.CAFE }
      )
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it("should keep dishes if not provided in update", async () => {
    const [dish1, dish2] = await Promise.all([
      dishRepository.create({
        nome: "Macarrão à Bolonhesa",
        categoria: CategoriaPrato.ALMOCO,
      }),
      dishRepository.create({
        nome: "Arroz Doce",
        categoria: CategoriaPrato.SOBREMESA,
      })
    ])

    const menuMaria = await menuRepository.create({
      title: "Cardapio Maria",
      checkIn: new Date("2026-02-10"),
      checkOut: new Date("2026-02-25"),
      adults: 2,
      kids: 1,
      restricoes: ["sem lactose"],
      preferencias: "Prefere comidas leves"
    })

    const lunch = await mealRepository.create({
      menuId: menuMaria.id,
      date: new Date("2026-02-02"),
      type: TipoRefeicao.ALMOCO,
      dishes: [dish1.id, dish2.id]
    })

    const response = await sut.execute(
      { mealId: lunch.id, menuId: menuMaria.id },
      {
        date: new Date("2026-02-05")
      }
    )

    expect(response.meal.pratos).toHaveLength(2)
    expect(response.meal.pratos.map((p: { id: any; }) => p.id)).toEqual([dish1.id, dish2.id])
  })
})