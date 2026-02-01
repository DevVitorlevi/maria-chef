import type { Menu } from "@/@types/menu"
import type { UpdateMenuInput, UpdateMenuOutput } from "@/repositories/DTOs/menu.dtos"
import type { MenuRepository } from "@/repositories/menu-repository"
import { InvalidAdultsError } from "@/utils/errors/invalid-adults-error"
import { InvalidDateError } from "@/utils/errors/invalid-date-error"
import { ResourceNotFoundError } from "@/utils/errors/resource-not-found-error"

export class UpdateMenuUseCase {
  constructor(private readonly menuRepository: MenuRepository) { }

  private validateAdults(data: UpdateMenuInput) {
    if (data.adults !== undefined && data.adults < 1) {
      throw new InvalidAdultsError()
    }
  }

  private validateDates(data: UpdateMenuInput) {
    if (!data.checkIn || !data.checkOut) return

    if (data.checkOut <= data.checkIn) {
      throw new InvalidDateError()
    }

    const diffInDays =
      (data.checkOut.getTime() - data.checkIn.getTime()) / (1000 * 60 * 60 * 24)

    if (Math.ceil(diffInDays) > 30) {
      throw new InvalidDateError()
    }
  }

  private validatePeriodChange(menu: Menu, data: UpdateMenuInput) {
    if (!data.checkIn && !data.checkOut) return

    const newCheckIn = data.checkIn ?? menu.checkin
    const newCheckOut = data.checkOut ?? menu.checkout

    const mealsOutsidePeriod =
      menu.refeicoes?.filter((meal: { data: Date | string | number }) => {
        const mealDate = new Date(meal.data)
        return mealDate < newCheckIn || mealDate > newCheckOut
      }) ?? []

    if (mealsOutsidePeriod.length > 0) {
      throw new Error(
        `Não é possível alterar o período pois existem ${mealsOutsidePeriod.length} refeições fora do novo intervalo`
      )
    }
  }

  async execute(id: string, data: UpdateMenuInput): Promise<UpdateMenuOutput> {
    const menu = await this.menuRepository.findById(id)

    if (!menu) {
      throw new ResourceNotFoundError()
    }

    this.validateAdults(data)
    this.validateDates(data)
    this.validatePeriodChange(menu, data)

    return this.menuRepository.update(id, data)
  }
}
