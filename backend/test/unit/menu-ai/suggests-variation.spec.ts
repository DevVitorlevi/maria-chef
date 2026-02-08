import { beforeEach, describe, expect, it, vi } from "vitest"
import { TipoRefeicao } from "../../../src/generated/prisma/enums"
import { SuggestsVariationUseCase } from "../../../src/use-cases/menu-ai/suggests-variation"
import { ResourceNotFoundError } from "../../../src/utils/errors/resource-not-found-error"
import { InMemoryMenuAiRepository } from "../../in-memory/in-memory-menu-ai-repository"
import { InMemoryMenuRepository } from "../../in-memory/in-memory-menu-repository"

describe("Suggests Variation Use Case (Unitary)", () => {
  let menuAiRepository: InMemoryMenuAiRepository
  let menuRepository: InMemoryMenuRepository
  let sut: SuggestsVariationUseCase

  beforeEach(() => {
    menuAiRepository = new InMemoryMenuAiRepository()
    menuRepository = new InMemoryMenuRepository()
    sut = new SuggestsVariationUseCase(menuAiRepository, menuRepository)
  })

  it("should be able to suggest variations with full dish details", async () => {
    const menu = await menuRepository.create({
      title: "Menu da Maria",
      adults: 2,
      restricoes: ["sem_lactose"],
      preferencias: "Comida caseira",
      checkIn: new Date("2026-03-01"),
      checkOut: new Date("2026-03-05"),
    })

    const result = await sut.execute({
      menuId: menu.id,
      pratoOriginal: "Frango Grelhado",
      contexto: {
        tipo: TipoRefeicao.ALMOCO,
        restricoes: [],
        preferencias: ""
      }
    })

    expect(result.dishes.length).toBeGreaterThan(0)
    expect(result.dishes[0]).toHaveProperty("nome")
    expect(result.dishes[0].ingredientes.length).toBeGreaterThan(0)
    expect(result.categoria).toContain("Frango Grelhado")
  })

  it("should respect menu restrictions and return safe ingredients", async () => {
    const menu = await menuRepository.create({
      title: "Menu Vegetariano",
      adults: 1,
      restricoes: ["vegetariano"],
      preferencias: "Lanches rápidos",
      checkIn: new Date("2026-03-01"),
      checkOut: new Date("2026-03-05"),
    })

    const result = await sut.execute({
      menuId: menu.id,
      pratoOriginal: "Peixe",
      contexto: {
        tipo: TipoRefeicao.ALMOCO,
        restricoes: [],
        preferencias: ""
      }
    })

    const hasAnimalProtein = result.dishes.some((dish: { nome: string }) =>
      dish.nome.toLowerCase().includes("peixe") ||
      dish.nome.toLowerCase().includes("camarão")
    )

    expect(hasAnimalProtein).toBe(false)
    expect(result.dishes[0].nome).toBe("Moqueca de Banana da Terra")
  })

  it("should pass correct menu preferences to the AI repository", async () => {
    const menu = await menuRepository.create({
      title: "Menu Luxo",
      adults: 2,
      restricoes: [],
      preferencias: "Frutos do mar caros",
      checkIn: new Date("2026-03-01"),
      checkOut: new Date("2026-03-05"),
    })

    const spy = vi.spyOn(menuAiRepository, "variations")

    await sut.execute({
      menuId: menu.id,
      pratoOriginal: "Arroz",
      contexto: {
        tipo: TipoRefeicao.ALMOCO,
        restricoes: [],
        preferencias: ""
      }
    })

    expect(spy).toHaveBeenCalledWith(expect.objectContaining({
      contexto: expect.objectContaining({
        preferencias: "Frutos do mar caros"
      })
    }))
  })

  it("should throw ResourceNotFoundError if menu does not exist", async () => {
    await expect(
      sut.execute({
        menuId: "non-existing-id",
        pratoOriginal: "Arroz",
        contexto: {
          tipo: TipoRefeicao.ALMOCO,
          restricoes: [],
          preferencias: ""
        }
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})