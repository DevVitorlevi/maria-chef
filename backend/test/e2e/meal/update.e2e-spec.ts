import { CategoriaIngrediente, CategoriaPrato, TipoRefeicao } from "@/generated/prisma/enums"
import request from "supertest"
import { beforeEach, describe, expect, it } from "vitest"
import { setupE2E } from "../../utils/setup-e2e"

describe("Update Meal (E2E)", () => {
  let app: Awaited<ReturnType<typeof setupE2E>>

  beforeEach(async () => {
    app = await setupE2E()
  })

  it("should be able to update meal from a menu", async () => {
    const createdDish = await request(app.server)
      .post("/dish")
      .send({
        nome: "Pizza Margherita",
        categoria: CategoriaPrato.ALMOCO,
      })

    const dishId = createdDish.body.id

    await request(app.server)
      .post(`/dish/${dishId}/ingredient`)
      .send({
        nome: "Farinha de Trigo",
        quantidade: 1,
        unidade: "kg",
        categoria: CategoriaIngrediente.OUTROS,
      })

    const createMenu = await request(app.server)
      .post("/cardapio")
      .send({
        title: "Cardápio Família Silva",
        checkIn: "2026-02-01",
        checkOut: "2026-02-05",
        adults: 2,
        kids: 2,
      })

    const menuId = createMenu.body.menu.id

    const createMeal = await request(app.server)
      .post(`/cardapio/${menuId}/refeicao`)
      .send({
        date: "2026-02-03",
        type: TipoRefeicao.ALMOCO,
        dishes: [dishId],
      })

    const mealId = createMeal.body.meal.id

    const response = await request(app.server)
      .put(`/cardapio/${menuId}/refeicao/${mealId}`)
      .send({
        date: "2026-02-04",
        type: TipoRefeicao.JANTAR,
        dishes: [dishId],
      })

    expect(response.status).toBe(200)
    expect(response.body.meal).toEqual(
      expect.objectContaining({
        id: mealId,
        data: "2026-02-04T00:00:00.000Z",
        tipo: TipoRefeicao.JANTAR,
        cardapioId: menuId,
      })
    )
  })

  it("should be able to update only meal date", async () => {
    const createdDish = await request(app.server)
      .post("/dish")
      .send({
        nome: "Arroz",
        categoria: CategoriaPrato.ALMOCO,
      })

    const dishId = createdDish.body.id

    const createMenu = await request(app.server)
      .post("/cardapio")
      .send({
        title: "Cardápio Teste",
        checkIn: "2026-02-01",
        checkOut: "2026-02-10",
        adults: 2,
        kids: 0,
      })

    const menuId = createMenu.body.menu.id

    const createMeal = await request(app.server)
      .post(`/cardapio/${menuId}/refeicao`)
      .send({
        date: "2026-02-03",
        type: TipoRefeicao.ALMOCO,
        dishes: [dishId],
      })

    const mealId = createMeal.body.meal.id

    const response = await request(app.server)
      .put(`/cardapio/${menuId}/refeicao/${mealId}`)
      .send({
        date: "2026-02-05",
      })

    expect(response.status).toBe(200)
    expect(response.body.meal.data).toBe("2026-02-05T00:00:00.000Z")
    expect(response.body.meal.tipo).toBe(TipoRefeicao.ALMOCO)
  })

  it("should be able to update only meal type", async () => {
    const createdDish = await request(app.server)
      .post("/dish")
      .send({
        nome: "Torrada",
        categoria: CategoriaPrato.CAFE_MANHA,
      })

    const dishId = createdDish.body.id

    const createMenu = await request(app.server)
      .post("/cardapio")
      .send({
        title: "Cardápio Teste",
        checkIn: "2026-02-01",
        checkOut: "2026-02-10",
        adults: 2,
        kids: 0,
      })

    const menuId = createMenu.body.menu.id

    const createMeal = await request(app.server)
      .post(`/cardapio/${menuId}/refeicao`)
      .send({
        date: "2026-02-03",
        type: TipoRefeicao.CAFE,
        dishes: [dishId],
      })

    const mealId = createMeal.body.meal.id

    const response = await request(app.server)
      .put(`/cardapio/${menuId}/refeicao/${mealId}`)
      .send({
        type: TipoRefeicao.ALMOCO,
      })

    expect(response.status).toBe(200)
    expect(response.body.meal.tipo).toBe(TipoRefeicao.ALMOCO)
    expect(response.body.meal.data).toBe("2026-02-03T00:00:00.000Z")
  })

  it("should be able to update meal dishes", async () => {
    const dish1 = await request(app.server)
      .post("/dish")
      .send({
        nome: "Arroz",
        categoria: CategoriaPrato.ALMOCO,
      })

    const dish2 = await request(app.server)
      .post("/dish")
      .send({
        nome: "Feijão",
        categoria: CategoriaPrato.ALMOCO,
      })

    const dish3 = await request(app.server)
      .post("/dish")
      .send({
        nome: "Bife",
        categoria: CategoriaPrato.ALMOCO,
      })

    const dishId1 = dish1.body.id
    const dishId2 = dish2.body.id
    const dishId3 = dish3.body.id

    const createMenu = await request(app.server)
      .post("/cardapio")
      .send({
        title: "Cardápio Teste",
        checkIn: "2026-02-01",
        checkOut: "2026-02-10",
        adults: 2,
        kids: 0,
      })

    const menuId = createMenu.body.menu.id

    const createMeal = await request(app.server)
      .post(`/cardapio/${menuId}/refeicao`)
      .send({
        date: "2026-02-03",
        type: TipoRefeicao.ALMOCO,
        dishes: [dishId1],
      })

    const mealId = createMeal.body.meal.id

    const response = await request(app.server)
      .put(`/cardapio/${menuId}/refeicao/${mealId}`)
      .send({
        dishes: [dishId1, dishId2, dishId3],
      })

    expect(response.status).toBe(200)
    expect(response.body.meal.pratos).toHaveLength(3)

    const dishNames = response.body.meal.pratos.map((dish: any) => dish.nome)
    expect(dishNames).toContain("Arroz")
    expect(dishNames).toContain("Feijão")
    expect(dishNames).toContain("Bife")
  })

  it("should be able to replace dishes in meal", async () => {
    const dish1 = await request(app.server)
      .post("/dish")
      .send({
        nome: "Pizza",
        categoria: CategoriaPrato.JANTAR,
      })

    const dish2 = await request(app.server)
      .post("/dish")
      .send({
        nome: "Lasanha",
        categoria: CategoriaPrato.JANTAR,
      })

    const dishId1 = dish1.body.id
    const dishId2 = dish2.body.id

    const createMenu = await request(app.server)
      .post("/cardapio")
      .send({
        title: "Cardápio Teste",
        checkIn: "2026-02-01",
        checkOut: "2026-02-10",
        adults: 2,
        kids: 0,
      })

    const menuId = createMenu.body.menu.id

    const createMeal = await request(app.server)
      .post(`/cardapio/${menuId}/refeicao`)
      .send({
        date: "2026-02-03",
        type: TipoRefeicao.JANTAR,
        dishes: [dishId1],
      })

    const mealId = createMeal.body.meal.id

    const response = await request(app.server)
      .put(`/cardapio/${menuId}/refeicao/${mealId}`)
      .send({
        dishes: [dishId2],
      })

    expect(response.status).toBe(200)
    expect(response.body.meal.pratos).toHaveLength(1)
    expect(response.body.meal.pratos[0].nome).toBe("Lasanha")

    const dishNames = response.body.meal.pratos.map((dish: any) => dish.nome)
    expect(dishNames).not.toContain("Pizza")
  })

  it("should not be able to update a meal does not exist", async () => {
    const createMenu = await request(app.server)
      .post("/cardapio")
      .send({
        title: "Cardápio Teste",
        checkIn: "2026-02-01",
        checkOut: "2026-02-05",
        adults: 2,
        kids: 0,
      })

    const menuId = createMenu.body.menu.id
    const nonExistentMealId = "non-existent-meal-id"

    const response = await request(app.server)
      .put(`/cardapio/${menuId}/refeicao/${nonExistentMealId}`)
      .send({
        date: "2026-02-04",
      })

    expect(response.status).toBe(400)
  })

  it("should not be able dishes array is empty", async () => {
    const createdDish = await request(app.server)
      .post("/dish")
      .send({
        nome: "Salada",
        categoria: CategoriaPrato.ALMOCO,
      })

    const dishId = createdDish.body.id

    const createMenu = await request(app.server)
      .post("/cardapio")
      .send({
        title: "Cardápio Teste",
        checkIn: "2026-02-01",
        checkOut: "2026-02-05",
        adults: 2,
        kids: 0,
      })

    const menuId = createMenu.body.menu.id

    const createMeal = await request(app.server)
      .post(`/cardapio/${menuId}/refeicao`)
      .send({
        date: "2026-02-03",
        type: TipoRefeicao.ALMOCO,
        dishes: [dishId],
      })

    const mealId = createMeal.body.meal.id

    const response = await request(app.server)
      .put(`/cardapio/${menuId}/refeicao/${mealId}`)
      .send({
        dishes: [],
      })

    expect(response.status).toBe(400)
  })

  it("should update all fields at once", async () => {
    const dish1 = await request(app.server)
      .post("/dish")
      .send({
        nome: "Pão",
        categoria: CategoriaPrato.CAFE_MANHA,
      })

    const dish2 = await request(app.server)
      .post("/dish")
      .send({
        nome: "Café",
        categoria: CategoriaPrato.CAFE_MANHA,
      })

    const dishId1 = dish1.body.id
    const dishId2 = dish2.body.id

    const createMenu = await request(app.server)
      .post("/cardapio")
      .send({
        title: "Cardápio Completo",
        checkIn: "2026-02-01",
        checkOut: "2026-02-10",
        adults: 3,
        kids: 1,
      })

    const menuId = createMenu.body.menu.id

    const createMeal = await request(app.server)
      .post(`/cardapio/${menuId}/refeicao`)
      .send({
        date: "2026-02-03",
        type: TipoRefeicao.CAFE,
        dishes: [dishId1],
      })

    const mealId = createMeal.body.meal.id

    const response = await request(app.server)
      .put(`/cardapio/${menuId}/refeicao/${mealId}`)
      .send({
        date: "2026-02-05",
        type: TipoRefeicao.CAFE,
        dishes: [dishId1, dishId2],
      })

    expect(response.status).toBe(200)
    expect(response.body.meal).toEqual(
      expect.objectContaining({
        id: mealId,
        data: "2026-02-05T00:00:00.000Z",
        tipo: TipoRefeicao.CAFE,
        cardapioId: menuId,
      })
    )
    expect(response.body.meal.pratos).toHaveLength(2)
  })
})