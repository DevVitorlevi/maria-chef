import { config } from "dotenv"
import { beforeEach, describe, expect, it } from "vitest"
import { TipoRefeicao } from "@/generated/prisma/enums"
import { PrismaMenuAIRepository } from "@repositories/prisma/prisma-menu-ai-repository"
import { PrismaMenuRepository } from "@repositories/prisma/prisma-menu-repository"
import { MenuAiSuggestsUseCase } from "@/use-cases/menu-ai/suggests"
import { setupE2E } from "test/utils/setup-e2e"

config()

describe("Menu AI Suggests Integration", () => {
  let suggestsUseCase: MenuAiSuggestsUseCase
  let menuRepository: PrismaMenuRepository
  let aiRepository: PrismaMenuAIRepository

  beforeEach(async () => {
    await setupE2E()

    menuRepository = new PrismaMenuRepository()
    aiRepository = new PrismaMenuAIRepository()
    suggestsUseCase = new MenuAiSuggestsUseCase(menuRepository, aiRepository)
  })

  it("should generate real AI suggestions and respect Prisma enums", async () => {
    const menu = await menuRepository.create({
      title: "Temporada Icapuí",
      adults: 2,
      kids: 1,
      restricoes: ["sem_lactose"],
      preferencias: "Frutos do mar frescos",
      checkIn: new Date("2026-02-10"),
      checkOut: new Date("2026-02-15"),
    })

    const result = await suggestsUseCase.execute(
      { menuId: menu.id },
      { type: TipoRefeicao.ALMOCO, date: new Date("2026-02-11") }
    )

    expect(result.dishes).toBeTruthy()
    expect(result.dishes[0]?.ingredientes).toBeTruthy()
    expect(Object.values(TipoRefeicao)).toContain(result.context.type)
  }, 60000)
})