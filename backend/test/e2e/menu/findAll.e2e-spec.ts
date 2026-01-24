import { CategoriaIngrediente, CategoriaPrato, TipoRefeicao } from "@/generated/prisma/enums"
import request from "supertest"
import { beforeEach, describe, expect, it } from "vitest"
import { setupE2E } from "../../utils/setup-e2e"

describe("Find All Menus (E2E)", () => {
  let app: Awaited<ReturnType<typeof setupE2E>>

  beforeEach(async () => {
    app = await setupE2E()
  })

  it("should be able to find all menus", async () => {
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

    await request(app.server)
      .post(`/cardapio/${menuId}/refeicao`)
      .send({
        date: "2026-02-03",
        type: TipoRefeicao.ALMOCO,
        dishes: [dishId],
      })

    const response = await request(app.server)
      .get("/cardapios")
      .send()

    expect(response.status).toBe(200)
    expect(response.body.menus).toHaveLength(1)
    expect(response.body.total).toBe(1)
    expect(response.body.page).toBe(1)
    expect(response.body.totalPages).toBe(1)

    expect(response.body.menus[0]).toEqual(
      expect.objectContaining({
        id: menuId,
        titulo: "Cardápio Família Silva",
        adultos: 2,
        criancas: 2
      })
    )
  })

  it("should return empty list when no menus exist", async () => {
    const response = await request(app.server)
      .get("/cardapios")
      .send()

    expect(response.status).toBe(200)
    expect(response.body.menus).toEqual([])
    expect(response.body.total).toBe(0)
  })

  it("should be able to search menus by title", async () => {
    await request(app.server)
      .post("/cardapio")
      .send({
        title: "Família Silva - Janeiro",
        checkIn: "2026-01-10",
        checkOut: "2026-01-15",
        adults: 2,
        kids: 1,
      })

    await request(app.server)
      .post("/cardapio")
      .send({
        title: "Família Silva - Fevereiro",
        checkIn: "2026-02-10",
        checkOut: "2026-02-15",
        adults: 2,
        kids: 1,
      })

    await request(app.server)
      .post("/cardapio")
      .send({
        title: "Família Costa - Janeiro",
        checkIn: "2026-01-10",
        checkOut: "2026-01-15",
        adults: 3,
        kids: 2,
      })

    const response = await request(app.server)
      .get("/cardapios")
      .query({ titulo: "silva" })
      .send()

    expect(response.status).toBe(200)
    expect(response.body.menus).toHaveLength(2)
    expect(response.body.total).toBe(2)
    expect(response.body.menus.every((menu: any) =>
      menu.titulo.toLowerCase().includes("silva")
    )).toBe(true)
  })

  it("should be able to filter menus by specific date", async () => {
    await request(app.server)
      .post("/cardapio")
      .send({
        title: "Cardápio A",
        checkIn: "2025-01-10",
        checkOut: "2025-01-12",
        adults: 2,
        kids: 0,
      })

    await request(app.server)
      .post("/cardapio")
      .send({
        title: "Cardápio B",
        checkIn: "2025-01-15",
        checkOut: "2025-01-17",
        adults: 2,
        kids: 0,
      })

    await request(app.server)
      .post("/cardapio")
      .send({
        title: "Cardápio C",
        checkIn: "2025-01-10",
        checkOut: "2025-01-20",
        adults: 2,
        kids: 0,
      })

    const response = await request(app.server)
      .get("/cardapios")
      .query({ data: "2025-01-15" })
      .send()

    expect(response.status).toBe(200)
    expect(response.body.menus).toHaveLength(2)
    expect(response.body.total).toBe(2)

    const titles = response.body.menus.map((menu: any) => menu.titulo)
    expect(titles).toContain("Cardápio B")
    expect(titles).toContain("Cardápio C")
    expect(titles).not.toContain("Cardápio A")
  })


  it("should apply combined filters (search + date)", async () => {
    await request(app.server)
      .post("/cardapio")
      .send({
        title: "Família Silva - Janeiro",
        checkIn: "2025-01-10",
        checkOut: "2025-01-20",
        adults: 4,
        kids: 2,
      })

    await request(app.server)
      .post("/cardapio")
      .send({
        title: "Família Silva - Fevereiro",
        checkIn: "2025-02-10",
        checkOut: "2025-02-20",
        adults: 4,
        kids: 2,
      })

    await request(app.server)
      .post("/cardapio")
      .send({
        title: "Família Costa - Janeiro",
        checkIn: "2025-01-10",
        checkOut: "2025-01-20",
        adults: 3,
        kids: 1,
      })

    const response = await request(app.server)
      .get("/cardapios")
      .query({
        titulo: "silva",
        data: "2025-01-15"
      })
      .send()

    expect(response.status).toBe(200)
    expect(response.body.menus).toHaveLength(1)
    expect(response.body.total).toBe(1)
    expect(response.body.menus[0].titulo).toBe("Família Silva - Janeiro")
  })

  it("should paginate results correctly", async () => {
    const createPromises = Array.from({ length: 25 }, (_, i) =>
      request(app.server)
        .post("/cardapio")
        .send({
          title: `Cardápio ${i + 1}`,
          checkIn: "2026-01-10",
          checkOut: "2026-01-15",
          adults: 2,
          kids: 0,
        })
    )
    await Promise.all(createPromises)

    const page1Response = await request(app.server)
      .get("/cardapios")
      .query({ page: 1 })
      .send()

    expect(page1Response.status).toBe(200)
    expect(page1Response.body.menus).toHaveLength(20)
    expect(page1Response.body.total).toBe(25)
    expect(page1Response.body.page).toBe(1)
    expect(page1Response.body.totalPages).toBe(2)

    const page2Response = await request(app.server)
      .get("/cardapios")
      .query({ page: 2 })
      .send()

    expect(page2Response.status).toBe(200)
    expect(page2Response.body.menus).toHaveLength(5)
    expect(page2Response.body.total).toBe(25)
    expect(page2Response.body.page).toBe(2)
    expect(page2Response.body.totalPages).toBe(2)
  })

})