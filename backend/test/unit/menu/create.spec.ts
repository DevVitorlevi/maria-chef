import { beforeEach, describe, expect, it } from "vitest";
import { CreateMenuUseCase } from "../../../src/use-cases/menu/create";
import { InvalidDateError } from "../../../src/utils/errors/invalid-date-error";
import { InMemoryMenuRepository } from "../../in-memory/in-memory-menu-repository";

describe("Create Menu Use Case", () => {
  let menuRepository: InMemoryMenuRepository
  let sut: CreateMenuUseCase

  beforeEach(() => {
    menuRepository = new InMemoryMenuRepository()
    sut = new CreateMenuUseCase(menuRepository)
  })

  it("should be able to create a menu with all fields", async () => {
    const checkIn = new Date('2026-02-01')
    const checkOut = new Date('2026-02-05')

    const { menu } = await sut.execute({
      title: "Cardapio Maria",
      checkIn,
      checkOut,
      adults: 2,
      kids: 1,
      restricoes: ["vegetariano", "sem lactose"],
      preferencias: "Prefere comidas leves"
    })

    expect(menu.id).toEqual(expect.any(String))
    expect(menu.titulo).toBe("Cardapio Maria")
    expect(menu.checkin).toEqual(checkIn)
    expect(menu.checkout).toEqual(checkOut)
    expect(menu.adultos).toBe(2)
    expect(menu.criancas).toBe(1)
    expect(menu.restricoes).toEqual(["vegetariano", "sem lactose"])
    expect(menu.preferencias).toBe("Prefere comidas leves")
    expect(menu.geradoPorIA).toBe(false)
    expect(menu.createdAt).toBeInstanceOf(Date)
    expect(menu.updatedAt).toBeInstanceOf(Date)
    expect(menuRepository.database).toHaveLength(1)
  })

  it("should be able to create a menu with only required fields", async () => {
    const checkIn = new Date('2026-03-10')
    const checkOut = new Date('2026-03-15')

    const { menu } = await sut.execute({
      title: "Cardapio Simples",
      checkIn,
      checkOut,
      adults: 1,
      kids: 0,
    })

    expect(menu.id).toEqual(expect.any(String))
    expect(menu.titulo).toBe("Cardapio Simples")
    expect(menu.adultos).toBe(1)
    expect(menu.criancas).toBe(0)
    expect(menu.restricoes).toEqual([])
    expect(menu.preferencias).toEqual("")
    expect(menuRepository.database).toHaveLength(1)
  })

  it("should be able to create a menu with empty restrictions array", async () => {
    const checkIn = new Date('2026-04-01')
    const checkOut = new Date('2026-04-03')

    const { menu } = await sut.execute({
      title: "Cardapio Sem Restricoes",
      checkIn,
      checkOut,
      adults: 3,
      kids: 2,
      restricoes: [],
      preferencias: null
    })

    expect(menu.restricoes).toEqual([])
    expect(menu.preferencias).toEqual("")
    expect(menuRepository.database).toHaveLength(1)
  })

  it("should be able to create multiple menus", async () => {
    const checkIn1 = new Date('2026-05-01')
    const checkOut1 = new Date('2026-05-05')

    await sut.execute({
      title: "Cardapio 1",
      checkIn: checkIn1,
      checkOut: checkOut1,
      adults: 2,
      kids: 1,
    })

    const checkIn2 = new Date('2026-06-01')
    const checkOut2 = new Date('2026-06-05')

    await sut.execute({
      title: "Cardapio 2",
      checkIn: checkIn2,
      checkOut: checkOut2,
      adults: 4,
      kids: 2,
    })

    expect(menuRepository.database).toHaveLength(2)
    expect(menuRepository.database[0].titulo).toBe("Cardapio 1")
    expect(menuRepository.database[1].titulo).toBe("Cardapio 2")
  })

  it("should create menus with unique IDs", async () => {
    const checkIn = new Date('2026-07-01')
    const checkOut = new Date('2026-07-05')

    const { menu: menu1 } = await sut.execute({
      title: "Cardapio A",
      checkIn,
      checkOut,
      adults: 2,
      kids: 0,
    })

    const { menu: menu2 } = await sut.execute({
      title: "Cardapio B",
      checkIn,
      checkOut,
      adults: 2,
      kids: 0,
    })

    expect(menu1.id).not.toBe(menu2.id)
  })

  it("should not be able to create a menu with checkout before checkin", async () => {
    const checkIn = new Date('2026-02-05')
    const checkOut = new Date('2026-02-01')

    await expect(
      sut.execute({
        title: "Cardapio Invalido",
        checkIn,
        checkOut,
        adults: 2,
        kids: 0,
      })
    ).rejects.toBeInstanceOf(InvalidDateError)
  })

  it("should be able to create a menu with same date for checkin and checkout", async () => {
    const sameDate = new Date('2026-02-01')

    const { menu } = await sut.execute({
      title: "Cardapio Mesmo Dia",
      checkIn: sameDate,
      checkOut: sameDate,
      adults: 2,
      kids: 0,
    })

    expect(menu.checkin).toEqual(sameDate)
    expect(menu.checkout).toEqual(sameDate)
    expect(menuRepository.database).toHaveLength(1)
  })

  it("should accept menu with multiple dietary restrictions", async () => {
    const checkIn = new Date('2026-08-01')
    const checkOut = new Date('2026-08-05')

    const { menu } = await sut.execute({
      title: "Cardapio Restricoes Multiplas",
      checkIn,
      checkOut,
      adults: 2,
      kids: 1,
      restricoes: ["vegetariano", "sem gluten", "sem lactose", "organico"],
      preferencias: "Comidas orgânicas e naturais"
    })

    expect(menu.restricoes).toHaveLength(4)
    expect(menu.restricoes).toContain("vegetariano")
    expect(menu.restricoes).toContain("sem gluten")
    expect(menu.restricoes).toContain("sem lactose")
    expect(menu.restricoes).toContain("organico")
  })

  it("should accept menu with long preferences text", async () => {
    const checkIn = new Date('2026-09-01')
    const checkOut = new Date('2026-09-05')

    const longPreferences = "Prefere comidas leves, saudáveis, com baixo teor de gordura. Gosta muito de frutas frescas no café da manhã. No almoço prefere saladas e proteínas grelhadas. Evita frituras e alimentos processados."

    const { menu } = await sut.execute({
      title: "Cardapio Preferencias Longas",
      checkIn,
      checkOut,
      adults: 1,
      kids: 0,
      preferencias: longPreferences
    })

    expect(menu.preferencias).toBe(longPreferences)
  })

  it("should accept menu with maximum number of adults and kids", async () => {
    const checkIn = new Date('2026-10-01')
    const checkOut = new Date('2026-10-05')

    const { menu } = await sut.execute({
      title: "Cardapio Familia Grande",
      checkIn,
      checkOut,
      adults: 10,
      kids: 8,
    })

    expect(menu.adultos).toBe(10)
    expect(menu.criancas).toBe(8)
  })
})