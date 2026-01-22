import { beforeEach, describe, expect, it } from "vitest";
import { FindByIdMenuUseCase } from "../../../src/use-cases/menu/findById";
import { ResourceNotFoundError } from "../../../src/utils/errors/resource-not-found-error";
import { InMemoryMenuRepository } from "../../in-memory/in-memory-menu-repository";
describe("FindById Menu Use Case", () => {
  let menuRepository: InMemoryMenuRepository
  let sut: FindByIdMenuUseCase

  beforeEach(() => {
    menuRepository = new InMemoryMenuRepository()
    sut = new FindByIdMenuUseCase(menuRepository)
  })

  it("should be able to find a menu by id", async () => {
    const checkIn = new Date('2026-02-01')
    const checkOut = new Date('2026-02-05')

    const createMenu = await menuRepository.create({
      title: "Cardapio Maria",
      checkIn,
      checkOut,
      adults: 2,
      kids: 1,
      restricoes: ["vegetariano", "sem lactose"],
      preferencias: "Prefere comidas leves"
    })

    const { menu } = await sut.execute({
      menuId: createMenu.id
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

  it("should not be able to find an menu non-existent", async () => {
    await expect(
      sut.execute({
        menuId: "non-existent-menu"
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})